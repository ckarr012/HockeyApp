const {
  getTeamById,
  getPlayersByTeamId,
  getGamesByTeamId,
  getVideosByTeamId,
  getPracticesByTeamId
} = require('../models/teamModel');

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

const getDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await getPlayersByTeamId(teamId);
    const games = await getGamesByTeamId(teamId);
    const videos = await getVideosByTeamId(teamId);
    const practices = await getPracticesByTeamId(teamId);

  const activePlayers = players.filter(p => p.status === 'active').length;
  const injuredPlayers = players.filter(p => p.status === 'injured').length;
  
  const completedGames = games.filter(g => g.status === 'completed');
  const wins = completedGames.filter(g => g.team_score > g.opponent_score).length;
  const losses = completedGames.filter(g => g.team_score < g.opponent_score).length;
  const ties = completedGames.filter(g => g.team_score === g.opponent_score).length;
  
  const upcomingGames = games.filter(g => g.status === 'scheduled');
  const nextGame = upcomingGames.sort((a, b) => 
    new Date(a.game_date) - new Date(b.game_date)
  )[0] || null;

  const upcomingPractices = practices.sort((a, b) => 
    new Date(a.practice_date) - new Date(b.practice_date)
  );
  const nextPractice = upcomingPractices[0] || null;

    const dashboard = {
      team: {
        id: team.id,
        name: team.name,
        division: team.division,
        season: team.season
      },
      stats: {
        totalPlayers: players.length,
        activePlayers,
        injuredPlayers,
        totalGames: games.length,
        wins,
        losses,
        ties,
        upcomingGames: upcomingGames.length,
        totalVideos: videos.length,
        totalPractices: practices.length
      },
      nextGame,
      nextPractice
    };

    res.json(dashboard);
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

module.exports = {
  getPlayers,
  getDashboard,
  getGames
};
