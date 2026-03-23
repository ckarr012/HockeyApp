const {
  getTeamById,
  getPlayersByTeamId,
  getGamesByTeamId,
  getVideosByTeamId,
  getPracticesByTeamId,
  createGame,
  updateGameScore,
  deleteGame,
  deleteVideo,
  updateTeamSettings
} = require('../models/teamModel');
const { createPlayer } = require('../models/playerModel');

const getPlayers = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await getPlayersByTeamId(teamId);
    
    res.json({ players });
  } catch (error) {
    console.error('Error in getPlayers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addPlayer = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote } = req.body;

    if (!firstName || !lastName || !jerseyNumber || !position) {
      return res.status(400).json({ error: 'firstName, lastName, jerseyNumber, and position are required' });
    }

    const player = await createPlayer(teamId, { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status: status || 'active', injuryNote });
    res.status(201).json({ player });
  } catch (error) {
    console.error('Error in addPlayer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await getTeamById(teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const [players, games, videos, practices] = await Promise.all([
      getPlayersByTeamId(teamId),
      getGamesByTeamId(teamId),
      getVideosByTeamId(teamId),
      getPracticesByTeamId(teamId),
    ]);

    const activePlayers = players.filter(p => p.status === 'active');
    const injuredPlayers = players.filter(p => p.status === 'injured');
    const inactivePlayers = players.filter(p => p.status === 'inactive');

    const completedGames = games.filter(g => g.status === 'completed');
    const wins = completedGames.filter(g => g.teamScore > g.opponentScore).length;
    const losses = completedGames.filter(g => g.teamScore < g.opponentScore).length;
    const ties = completedGames.filter(g => g.teamScore === g.opponentScore).length;

    const now = new Date();

    const upcomingGames = games
      .filter(g => g.status === 'scheduled')
      .sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));
    const nextGame = upcomingGames[0] || null;

    const recentGames = completedGames
      .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate))
      .slice(0, 5);

    const futurePractices = practices
      .filter(p => new Date(p.practice_date) >= now)
      .sort((a, b) => new Date(a.practice_date) - new Date(b.practice_date));
    const nextPractice = futurePractices[0] || null;

    res.json({
      team: { id: team.id, name: team.name, division: team.division, season: team.season },
      stats: {
        totalPlayers: players.length,
        activePlayers: activePlayers.length,
        injuredPlayers: injuredPlayers.length,
        inactivePlayers: inactivePlayers.length,
        totalGames: games.length,
        wins, losses, ties,
        upcomingGames: upcomingGames.length,
        totalVideos: videos.length,
        totalPractices: practices.length,
      },
      nextGame,
      nextPractice,
      recentGames,
      injuredPlayersList: injuredPlayers,
    });
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGames = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const games = await getGamesByTeamId(teamId);
    
    res.json({ games });
  } catch (error) {
    console.error('Error in getGames:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addGame = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { game_date, opponent, location, home_away, status } = req.body;
    
    const gameId = await createGame(teamId, {
      game_date,
      opponent,
      location,
      home_away,
      status
    });
    
    res.status(201).json({ message: 'Game created successfully', gameId });
  } catch (error) {
    console.error('Error in addGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateScore = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamScore, opponentScore } = req.body;
    
    await updateGameScore(gameId, teamScore, opponentScore);
    
    res.json({ message: 'Score updated successfully' });
  } catch (error) {
    console.error('Error in updateScore:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await deleteGame(gameId);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error in removeGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    await deleteVideo(videoId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error in removeVideo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, season, division } = req.body;
    
    await updateTeamSettings(teamId, { name, season, division });
    res.json({ message: 'Team settings updated successfully' });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPlayers,
  addPlayer,
  getDashboard,
  getGames,
  addGame,
  updateScore,
  removeGame,
  removeVideo,
  updateSettings
};
