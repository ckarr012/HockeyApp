const { getDb } = require('../db/database');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Helper: normalize name for matching (lowercase, strip apostrophes/hyphens, collapse whitespace)
const normalizeName = (name) => {
  return name.toLowerCase()
    .replace(/['\u2019-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const generateMatchupAnalysis = async (req, res) => {
  try {
    const { teamId, lineupId, opponentName, gameId } = req.body;

    if (!teamId || !lineupId || !opponentName) {
      return res.status(400).json({ 
        error: 'Missing required fields: teamId, lineupId, opponentName' 
      });
    }

    const db = await getDb();

    // Fetch lineup with all player details
    const lineupQuery = `
      SELECT 
        ls.line_type,
        ls.position,
        p.id as player_id,
        p.first_name,
        p.last_name,
        p.jersey_number,
        p.position as player_position,
        p.shoots,
        p.height,
        p.weight
      FROM lineup_slots ls
      LEFT JOIN players p ON ls.player_id = p.id
      WHERE ls.lineup_id = ?
      ORDER BY ls.line_type, ls.position
    `;

    const lineupResult = db.exec(lineupQuery, [lineupId]);
    
    if (!lineupResult.length || !lineupResult[0].values.length) {
      return res.status(404).json({ error: 'Lineup not found or empty' });
    }

    const lineupColumns = lineupResult[0].columns;
    const lineupRows = lineupResult[0].values.map(row => {
      const obj = {};
      lineupColumns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    });

    // Fetch opponent roster
    const opponentRosterQuery = `
      SELECT 
        jersey_number,
        first_name,
        last_name,
        position,
        height,
        weight,
        hometown
      FROM opponent_rosters
      WHERE team_id = ? AND opponent_name = ?
      ORDER BY jersey_number
    `;

    const opponentRosterResult = db.exec(opponentRosterQuery, [teamId, opponentName]);
    const opponentRoster = opponentRosterResult.length && opponentRosterResult[0].values.length
      ? opponentRosterResult[0].values.map(row => {
          const obj = {};
          opponentRosterResult[0].columns.forEach((col, i) => obj[col] = row[i]);
          return obj;
        })
      : [];

    // Fetch opponent stats
    const opponentStatsQuery = `
      SELECT 
        player_name,
        games_played,
        goals,
        assists,
        points,
        pims,
        shots
      FROM opponent_player_stats
      WHERE team_id = ? AND opponent_name = ?
      ORDER BY points DESC, goals DESC
    `;

    const opponentStatsResult = db.exec(opponentStatsQuery, [teamId, opponentName]);
    const opponentStats = opponentStatsResult.length && opponentStatsResult[0].values.length
      ? opponentStatsResult[0].values.map(row => {
          const obj = {};
          opponentStatsResult[0].columns.forEach((col, i) => obj[col] = row[i]);
          return obj;
        })
      : [];

    // Fetch most recent scouting report
    const scoutingQuery = `
      SELECT 
        strengths,
        weaknesses,
        key_players_json,
        tactical_notes,
        power_play_tendency,
        goalie_weakness
      FROM scouting_reports
      WHERE team_id = ? AND opponent_name = ?
      ORDER BY date DESC
      LIMIT 1
    `;

    const scoutingResult = db.exec(scoutingQuery, [teamId, opponentName]);
    const scoutingReport = scoutingResult.length && scoutingResult[0].values.length
      ? (() => {
          const obj = {};
          scoutingResult[0].columns.forEach((col, i) => obj[col] = scoutingResult[0].values[0][i]);
          return obj;
        })()
      : null;

    // ═══ INTELLIGENT ROSTER-STATS JOINING ═══
    // Build name-to-stats lookup from Season 59 stats
    const statsLookup = new Map();
    opponentStats.forEach(stat => {
      const normalizedName = normalizeName(stat.player_name);
      statsLookup.set(normalizedName, {
        gp: stat.games_played,
        g: stat.goals,
        a: stat.assists,
        pts: stat.points,
        pim: stat.pims,
        shots: stat.shots
      });
    });

    // Categorize Season 60 roster players
    const RETURNING_PLAYERS = [];
    const NEW_OR_UNKNOWN_PLAYERS = [];

    opponentRoster.forEach(player => {
      const fullName = `${player.first_name} ${player.last_name}`.trim();
      const normalizedName = normalizeName(fullName);
      const priorStats = statsLookup.get(normalizedName);

      if (priorStats) {
        // Player is on current roster AND has prior stats
        RETURNING_PLAYERS.push({
          jerseyNumber: player.jersey_number,
          firstName: player.first_name,
          lastName: player.last_name,
          position: player.position,
          priorStats
        });
        // Mark this stats entry as matched
        statsLookup.delete(normalizedName);
      } else {
        // Player is on current roster but NO prior stats
        NEW_OR_UNKNOWN_PLAYERS.push({
          jerseyNumber: player.jersey_number,
          firstName: player.first_name,
          lastName: player.last_name,
          position: player.position
        });
      }
    });

    // Remaining entries in statsLookup are departed players
    const DEPARTED_TOP_SCORERS = [];
    opponentStats.forEach(stat => {
      const normalizedName = normalizeName(stat.player_name);
      if (statsLookup.has(normalizedName) && stat.points >= 3) {
        DEPARTED_TOP_SCORERS.push({
          playerName: stat.player_name,
          priorStats: {
            gp: stat.games_played,
            g: stat.goals,
            a: stat.assists,
            pts: stat.points,
            pim: stat.pims,
            shots: stat.shots
          }
        });
      }
    });

    // Sort arrays
    RETURNING_PLAYERS.sort((a, b) => b.priorStats.pts - a.priorStats.pts);
    NEW_OR_UNKNOWN_PLAYERS.sort((a, b) => (a.jerseyNumber || 999) - (b.jerseyNumber || 999));
    DEPARTED_TOP_SCORERS.sort((a, b) => b.priorStats.pts - a.priorStats.pts);
    DEPARTED_TOP_SCORERS.splice(10); // Cap at top 10

    // Build structured lineup data
    const forwardLines = [];
    const defensePairs = [];
    
    lineupRows.forEach(slot => {
      if (slot.line_type && slot.line_type.startsWith('line')) {
        const lineNum = parseInt(slot.line_type.replace('line', ''));
        if (!forwardLines[lineNum - 1]) {
          forwardLines[lineNum - 1] = { lineNumber: lineNum, players: [] };
        }
        if (slot.player_id) {
          forwardLines[lineNum - 1].players.push({
            name: `${slot.first_name} ${slot.last_name}`,
            jersey: slot.jersey_number,
            position: slot.position,
            shoots: slot.shoots,
            height: slot.height,
            weight: slot.weight
          });
        }
      } else if (slot.line_type && slot.line_type.startsWith('defense')) {
        const pairNum = parseInt(slot.line_type.replace('defense', ''));
        if (!defensePairs[pairNum - 1]) {
          defensePairs[pairNum - 1] = { pairNumber: pairNum, players: [] };
        }
        if (slot.player_id) {
          defensePairs[pairNum - 1].players.push({
            name: `${slot.first_name} ${slot.last_name}`,
            jersey: slot.jersey_number,
            position: slot.position,
            shoots: slot.shoots,
            height: slot.height,
            weight: slot.weight
          });
        }
      }
    });

    // Build Claude prompt with intelligent roster composition
    let opponentRosterSection = `CURRENT OPPONENT ROSTER (2025-26 season):

`;

    if (RETURNING_PLAYERS.length > 0) {
      opponentRosterSection += `Returning players (with prior-season stats for reference):\n`;
      RETURNING_PLAYERS.forEach(p => {
        opponentRosterSection += `- #${p.jerseyNumber || '?'} ${p.firstName} ${p.lastName} (${p.position || 'N/A'}) — Last season: ${p.priorStats.gp} GP, ${p.priorStats.g} G, ${p.priorStats.a} A, ${p.priorStats.pts} PTS\n`;
      });
      opponentRosterSection += '\n';
    }

    if (NEW_OR_UNKNOWN_PLAYERS.length > 0) {
      opponentRosterSection += `New or first-year players (no prior stats available):\n`;
      NEW_OR_UNKNOWN_PLAYERS.forEach(p => {
        opponentRosterSection += `- #${p.jerseyNumber || '?'} ${p.firstName} ${p.lastName} (${p.position || 'N/A'})\n`;
      });
      opponentRosterSection += '\n';
    }

    if (RETURNING_PLAYERS.length === 0) {
      opponentRosterSection += `Note: No players on the current roster have prior-season stats. This may be a heavily rebuilt team.\n\n`;
    }

    if (DEPARTED_TOP_SCORERS.length > 0) {
      opponentRosterSection += `DEPARTED NOTABLE PLAYERS (had significant prior-season production, NO LONGER on roster):\n`;
      DEPARTED_TOP_SCORERS.forEach(p => {
        opponentRosterSection += `- ${p.playerName} — Last season: ${p.priorStats.gp} GP, ${p.priorStats.g} G, ${p.priorStats.a} A, ${p.priorStats.pts} PTS\n`;
      });
      opponentRosterSection += '\n';
    }

    const prompt = `You are an expert hockey analyst generating line-matchup recommendations for an ACHA college coach.

OUR LINEUP:
${forwardLines.map(line => 
  `Line ${line.lineNumber}: ${line.players.map(p => `#${p.jersey} ${p.name} (${p.position})`).join(', ')}`
).join('\n')}

${defensePairs.map(pair => 
  `Defense Pair ${pair.pairNumber}: ${pair.players.map(p => `#${p.jersey} ${p.name}`).join(', ')}`
).join('\n')}

OPPONENT: ${opponentName}

${opponentRosterSection}
${scoutingReport ? `PRIOR SCOUTING REPORT:
Strengths: ${scoutingReport.strengths || 'N/A'}
Weaknesses: ${scoutingReport.weaknesses || 'N/A'}
Tactical Notes: ${scoutingReport.tactical_notes || 'N/A'}
Power Play: ${scoutingReport.power_play_tendency || 'N/A'}
Goalie Weakness: ${scoutingReport.goalie_weakness || 'N/A'}` : 'No prior scouting report available.'}

INSTRUCTIONS:
Base offensive threat assessment on RETURNING PLAYERS' prior stats when available. Do not assume new/first-year players have zero skill — they may be strong recruits or transfers with unknown ceiling. Do not include departed players in matchup recommendations.

In the confidenceNote, indicate your confidence level based on how many returning players there are relative to new players. Many returning players with stats = high confidence. Mostly new players = low confidence, flag it clearly.

Generate line matchup recommendations. Return ONLY valid JSON (no markdown fences, no preamble) with this exact schema:

{
  "forwardMatchups": [
    {
      "ourLineNumber": 1,
      "ourLineLabel": "Top line",
      "theirProjectedLine": "string describing their likely top line",
      "reasoning": "why this matchup makes sense",
      "priority": "high"
    }
  ],
  "defensivePairMatchups": [
    {
      "ourPairNumber": 1,
      "theirTopThreats": "names of their top offensive threats",
      "reasoning": "why this pair should handle these threats"
    }
  ],
  "keyPlayersToNeutralize": [
    {
      "opponentPlayerName": "string",
      "opponentJersey": "string",
      "suggestedMatchup": "which of our lines/pairs should face them",
      "rationale": "why this matchup works"
    }
  ],
  "powerPlayUnitSuggestion": "string describing recommended PP unit",
  "penaltyKillUnitSuggestion": "string describing recommended PK unit",
  "overallStrategy": "2-3 sentences summarizing the game plan",
  "confidenceNote": "any caveats about data quality or missing information"
}`;

    // Log roster composition
    console.log('Roster composition:', {
      returning: RETURNING_PLAYERS.length,
      new_or_unknown: NEW_OR_UNKNOWN_PLAYERS.length,
      departed_notable: DEPARTED_TOP_SCORERS.length
    });

    console.log('🤖 Sending matchup analysis request to Claude...');

    // Call Anthropic API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    console.log('✅ Received response from Claude');

    // Parse JSON response
    let analysisData;
    try {
      analysisData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', responseText);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: responseText
      });
    }

    // Insert into database
    const insertQuery = `
      INSERT INTO matchup_analyses 
        (team_id, game_id, opponent_name, lineup_id, analysis_json, summary, generated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    const analysisJson = JSON.stringify(analysisData);
    const summary = analysisData.overallStrategy || 'No summary available';

    db.run(insertQuery, [
      teamId,
      gameId || null,
      opponentName,
      lineupId,
      analysisJson,
      summary
    ]);

    // Get the inserted row ID
    const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
    const insertedId = lastIdResult[0].values[0][0];

    // Fetch the complete inserted row
    const selectQuery = `
      SELECT * FROM matchup_analyses WHERE id = ?
    `;
    const selectResult = db.exec(selectQuery, [insertedId]);
    
    if (!selectResult.length || !selectResult[0].values.length) {
      return res.status(500).json({ error: 'Failed to retrieve inserted analysis' });
    }

    const insertedRow = {};
    selectResult[0].columns.forEach((col, i) => {
      insertedRow[col] = selectResult[0].values[0][i];
    });

    // Parse analysis_json for response
    insertedRow.analysis = JSON.parse(insertedRow.analysis_json);
    delete insertedRow.analysis_json;

    res.status(201).json({
      message: 'Matchup analysis generated successfully',
      analysis: insertedRow
    });

  } catch (error) {
    console.error('Error in generateMatchupAnalysis:', error);
    res.status(500).json({ 
      error: 'Failed to generate matchup analysis',
      details: error.message 
    });
  }
};

const getMatchupAnalyses = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { opponentName, gameId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const db = await getDb();

    let query = `
      SELECT * FROM matchup_analyses
      WHERE team_id = ?
    `;
    const params = [teamId];

    if (opponentName) {
      query += ' AND opponent_name = ?';
      params.push(opponentName);
    }

    if (gameId) {
      query += ' AND game_id = ?';
      params.push(gameId);
    }

    query += ' ORDER BY generated_at DESC';

    const result = db.exec(query, params);

    if (!result.length || !result[0].values.length) {
      return res.json({ analyses: [] });
    }

    const analyses = result[0].values.map(row => {
      const obj = {};
      result[0].columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      
      // Parse analysis_json to object
      if (obj.analysis_json) {
        try {
          obj.analysis = JSON.parse(obj.analysis_json);
          delete obj.analysis_json;
        } catch (e) {
          console.error('Failed to parse analysis_json for row:', obj.id);
        }
      }
      
      return obj;
    });

    res.json({ analyses });

  } catch (error) {
    console.error('Error in getMatchupAnalyses:', error);
    res.status(500).json({ 
      error: 'Failed to fetch matchup analyses',
      details: error.message 
    });
  }
};

module.exports = {
  generateMatchupAnalysis,
  getMatchupAnalyses
};
