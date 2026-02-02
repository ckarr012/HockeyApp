const { getPlayerStatsByTeamId, getStatsByGameId, createBulkPlayerStats } = require('../models/statsModel');
const { v4: uuidv4 } = require('uuid');

const getTeamStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    const stats = await getPlayerStatsByTeamId(teamId);
    res.json({ stats });
  } catch (error) {
    console.error('Error in getTeamStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGameStats = async (req, res) => {
  try {
    const { gameId } = req.params;
    const stats = await getStatsByGameId(gameId);
    res.json({ stats });
  } catch (error) {
    console.error('Error in getGameStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const recordGameStats = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { stats } = req.body;

    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ error: 'Stats array is required' });
    }

    const statsWithIds = stats.map(stat => ({
      id: uuidv4(),
      playerId: stat.playerId,
      gameId,
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      shots: stat.shots || 0,
      blocks: stat.blocks || 0,
      pims: stat.pims || 0
    }));

    await createBulkPlayerStats(statsWithIds);
    res.status(201).json({ message: 'Stats recorded successfully', count: statsWithIds.length });
  } catch (error) {
    console.error('Error in recordGameStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTeamStats,
  getGameStats,
  recordGameStats
};
