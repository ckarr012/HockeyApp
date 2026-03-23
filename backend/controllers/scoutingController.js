const { v4: uuidv4 } = require('uuid');
const Anthropic = require('@anthropic-ai/sdk');
const {
  getScoutingReportsByTeam,
  getScoutingReportByGame,
  getScoutingReportById,
  createScoutingReport,
  updateScoutingReport,
  deleteScoutingReport
} = require('../models/scoutingModel');
const { getTeamById } = require('../models/teamModel');

const getReports = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const reports = await getScoutingReportsByTeam(teamId);
    res.json({ reports });
  } catch (error) {
    console.error('Error in getReports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReportByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const report = await getScoutingReportByGame(gameId, teamId);
    res.json({ report });
  } catch (error) {
    console.error('Error in getReportByGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createReport = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { game_id, opponent_name, date, strengths, weaknesses, key_players, tactical_notes, power_play_tendency, goalie_weakness } = req.body;

    if (!game_id || !opponent_name || !date) {
      return res.status(400).json({ error: 'Game ID, opponent name, and date are required' });
    }

    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if report already exists for this game
    const existingReport = await getScoutingReportByGame(game_id, teamId);
    if (existingReport) {
      return res.status(409).json({ error: 'Scouting report already exists for this game' });
    }

    const reportData = {
      id: uuidv4(),
      team_id: teamId,
      game_id,
      opponent_name,
      date,
      strengths,
      weaknesses,
      key_players_json: key_players ? JSON.stringify(key_players) : null,
      tactical_notes,
      power_play_tendency,
      goalie_weakness
    };

    const report = await createScoutingReport(reportData);
    res.status(201).json({ report });
  } catch (error) {
    console.error('Error in createReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { strengths, weaknesses, key_players, tactical_notes, power_play_tendency, goalie_weakness } = req.body;

    const existingReport = await getScoutingReportById(reportId);
    if (!existingReport) {
      return res.status(404).json({ error: 'Scouting report not found' });
    }

    const reportData = {
      strengths,
      weaknesses,
      key_players_json: key_players ? JSON.stringify(key_players) : existingReport.key_players_json,
      tactical_notes,
      power_play_tendency,
      goalie_weakness
    };

    const report = await updateScoutingReport(reportId, reportData);
    res.json({ report });
  } catch (error) {
    console.error('Error in updateReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const existingReport = await getScoutingReportById(reportId);
    if (!existingReport) {
      return res.status(404).json({ error: 'Scouting report not found' });
    }

    await deleteScoutingReport(reportId);
    res.json({ message: 'Scouting report deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateAiScoutingReport = async (req, res) => {
  try {
    const { opponentName, rawNotes, teamRoster } = req.body;

    if (!opponentName) {
      return res.status(400).json({ error: 'Opponent name is required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const rosterText = teamRoster?.length > 0
      ? `\nOUR ROSTER:\n${teamRoster.map(p => `#${p.jerseyNumber} ${p.firstName} ${p.lastName} (${p.position})`).join('\n')}`
      : '';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert ice hockey scouting analyst. Based on the scouting notes below, generate a comprehensive scouting report for the opponent.

OPPONENT: ${opponentName}

SCOUTING NOTES FROM COACH:
${rawNotes || 'No specific notes provided — generate a general opponent preparation template.'}
${rosterText}

Return ONLY a valid JSON object with NO markdown, NO code fences, just raw JSON:

{
  "strengths": "2-4 sentences about what this team does well",
  "weaknesses": "2-4 sentences about exploitable weaknesses",
  "powerPlayTendency": "2-3 sentences about their power play formation and tendencies",
  "goalieWeakness": "2-3 sentences about goalie tendencies and weak spots",
  "tacticalNotes": "3-5 sentences about overall game plan and tactical approach to beat this team",
  "keyPlayers": [
    {
      "name": "Player name (or 'Unknown' if not mentioned)",
      "number": 0,
      "position": "position",
      "notes": "why this player is dangerous and how to defend them"
    }
  ],
  "lineMatchupSuggestions": "2-3 sentences about suggested line matchups if roster was provided, otherwise general advice"
}

Extract key player info from the notes if mentioned. Include up to 3 key players. If no players are mentioned, suggest generic archetypes to watch for based on the team's described style.`,
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
    console.error('Error in generateAiScoutingReport:', error);
    res.status(500).json({ error: 'Failed to generate scouting report.' });
  }
};

module.exports = {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport,
  generateAiScoutingReport
};
