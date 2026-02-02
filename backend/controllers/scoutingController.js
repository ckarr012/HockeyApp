const { v4: uuidv4 } = require('uuid');
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

module.exports = {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport
};
