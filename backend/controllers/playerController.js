const { updatePlayerStatus, getPlayerById, updatePlayerFull: updateFull, deletePlayer } = require('../models/playerModel');
const Anthropic = require('@anthropic-ai/sdk');

const updateStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status, injury_note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const updatedPlayer = await updatePlayerStatus(playerId, { status, injury_note });
    res.json({ player: updatedPlayer });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePlayerFull = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote } = req.body;
    const updated = await updateFull(playerId, { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote });
    res.json({ player: updated });
  } catch (error) {
    console.error('Error in updatePlayerFull:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    await deletePlayer(playerId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in removePlayer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const importFromImage = async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are a hockey roster data extractor. Extract all player information from this roster image and return ONLY a valid JSON array — no explanation, no markdown, no code fences, just raw JSON.

Each player object should have these fields (use null for anything not found):
- firstName (string)
- lastName (string)
- jerseyNumber (number)
- position (one of: "center", "left_wing", "right_wing", "left_defense", "right_defense", "goalie")
- shoots (one of: "left", "right", or null)
- height (number in cm, or null)
- weight (number in kg, or null)
- birthDate (string in YYYY-MM-DD format, or null)
- status (default to "active")

For position, do your best to map common abbreviations: C=center, LW=left_wing, RW=right_wing, LD or LD=left_defense, RD=right_defense, G=goalie.
For height, convert feet/inches to cm if needed (e.g. 6'1" = 185cm).
For weight, convert lbs to kg if needed (e.g. 185lbs = 84kg).

Return ONLY the JSON array.`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].text.trim();

    let players;
    try {
      players = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not parse player data from image. Please try a clearer photo.' });
    }

    if (!Array.isArray(players)) {
      return res.status(422).json({ error: 'Unexpected response format. Please try again.' });
    }

    res.json({ players });
  } catch (error) {
    console.error('Error in importFromImage:', error);
    res.status(500).json({ error: 'Failed to analyze image.' });
  }
};

const importStatsFromImage = async (req, res) => {
  try {
    const { imageBase64, mediaType, playerNames } = req.body;
    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `You are a hockey stats extractor. Extract player stats from this box score or stat sheet image.

Known players on this team: ${(playerNames || []).join(', ')}

Return ONLY a valid JSON array — no explanation, no markdown, no code fences, just raw JSON.

Each object should have:
- playerName (string — match as closely as possible to the known players list, use full name)
- goals (number, default 0)
- assists (number, default 0)
- shots (number, default 0)
- blocks (number, default 0)
- pims (number — penalty minutes, default 0)

Only include players that appear in the stat sheet. If a stat column is missing, default to 0.
Return ONLY the JSON array.`,
          },
        ],
      }],
    });

    const raw = message.content[0].text.trim();
    let stats;
    try {
      stats = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not parse stats from image. Please try a clearer photo.' });
    }

    if (!Array.isArray(stats)) {
      return res.status(422).json({ error: 'Unexpected response format. Please try again.' });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error in importStatsFromImage:', error);
    res.status(500).json({ error: 'Failed to analyze image.' });
  }
};

const getPlayerDevelopment = async (req, res) => {
  try {
    const { playerId } = req.params;
    const db = await require('../db/database').getDb();

    // Per-game stats with game info
    const statsResult = db.exec(`
      SELECT 
        ps.id, ps.goals, ps.assists, ps.shots, ps.blocks, ps.pims,
        ps.goals + ps.assists as points,
        g.id as game_id, g.opponent, g.game_date, g.team_score, g.opponent_score, g.home_away
      FROM player_stats ps
      JOIN games g ON ps.game_id = g.id
      WHERE ps.player_id = ?
      ORDER BY g.game_date ASC
    `, [playerId]);

    const gameStats = statsResult.length > 0 ? statsResult[0].values.map(row => {
      const obj = {};
      statsResult[0].columns.forEach((col, i) => obj[col] = row[i]);
      return obj;
    }) : [];

    // Season totals
    const totals = gameStats.reduce((acc, g) => ({
      goals: acc.goals + g.goals,
      assists: acc.assists + g.assists,
      points: acc.points + g.points,
      shots: acc.shots + g.shots,
      blocks: acc.blocks + g.blocks,
      pims: acc.pims + g.pims,
      gamesPlayed: acc.gamesPlayed + 1,
    }), { goals: 0, assists: 0, points: 0, shots: 0, blocks: 0, pims: 0, gamesPlayed: 0 })

    // Current line assignment
    const lineResult = db.exec(`
      SELECT ls.line_type, ls.position, l.name as lineup_name
      FROM lineup_slots ls
      JOIN lineups l ON ls.lineup_id = l.id
      WHERE ls.player_id = ?
      LIMIT 1
    `, [playerId]);

    const lineAssignment = lineResult.length > 0 && lineResult[0].values.length > 0 ? {
      lineType: lineResult[0].values[0][0],
      position: lineResult[0].values[0][1],
      lineupName: lineResult[0].values[0][2],
    } : null;

    res.json({ gameStats, totals, lineAssignment });
  } catch (error) {
    console.error('Error in getPlayerDevelopment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generatePlayerAiReport = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { playerInfo, totals, gameStats, lineAssignment } = req.body;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const trend = gameStats.length >= 2 ? (() => {
      const half = Math.floor(gameStats.length / 2)
      const firstHalf = gameStats.slice(0, half)
      const secondHalf = gameStats.slice(half)
      const avgPoints = (arr) => arr.reduce((s, g) => s + g.points, 0) / arr.length
      const diff = avgPoints(secondHalf) - avgPoints(firstHalf)
      return diff > 0.3 ? 'improving' : diff < -0.3 ? 'declining' : 'consistent'
    })() : 'insufficient data'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are an expert ice hockey player development coach. Analyze this player's season data and generate a comprehensive development report.

PLAYER INFO:
Name: ${playerInfo.firstName} ${playerInfo.lastName}
Position: ${playerInfo.position}
Jersey: #${playerInfo.jerseyNumber}
Shoots: ${playerInfo.shoots || 'unknown'}
Status: ${playerInfo.status}
${playerInfo.injuryNote ? `Injury Note: ${playerInfo.injuryNote}` : ''}
${lineAssignment ? `Current Line: ${lineAssignment.lineType} (${lineAssignment.position}) in "${lineAssignment.lineupName}"` : 'Not currently assigned to a line'}

SEASON STATS (${totals.gamesPlayed} games):
Goals: ${totals.goals} | Assists: ${totals.assists} | Points: ${totals.points}
Shots: ${totals.shots} | Blocks: ${totals.blocks} | PIMs: ${totals.pims}
Points/Game: ${totals.gamesPlayed > 0 ? (totals.points / totals.gamesPlayed).toFixed(2) : '0.00'}

PERFORMANCE TREND: ${trend}

PER-GAME DATA:
${gameStats.map(g => `vs ${g.opponent} (${g.game_date?.slice(0, 10)}): ${g.goals}G ${g.assists}A ${g.shots}SOG`).join('\n') || 'No game data'}

Return ONLY a valid JSON object, no markdown, no code fences:
{
  "overallRating": "Elite|Above Average|Average|Developing|Needs Improvement",
  "summary": "2-3 sentence overall assessment of this player's season",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "areasToImprove": ["area 1", "area 2"],
  "trend": "${trend}",
  "trendAnalysis": "1-2 sentences explaining the performance trend",
  "recommendedDrills": [
    { "name": "drill name", "reason": "why this drill specifically helps this player" }
  ],
  "coachingTips": ["tip 1", "tip 2"],
  "lineRecommendation": "1 sentence about where this player should be deployed based on their stats"
}`
      }],
    });

    const raw = message.content[0].text.trim();
    let report;
    try {
      report = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not generate report. Please try again.' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Error in generatePlayerAiReport:', error);
    res.status(500).json({ error: 'Failed to generate report.' });
  }
};

module.exports = {
  updateStatus,
  updatePlayerFull,
  removePlayer,
  importFromImage,
  importStatsFromImage,
  getPlayerDevelopment,
  generatePlayerAiReport
};
