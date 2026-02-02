const { getDb } = require('../db/database');

const getCalendarEvents = async (teamId) => {
  const db = await getDb();
  
  // Fetch games
  const gamesResult = db.exec('SELECT * FROM games WHERE team_id = ?', [teamId]);
  const games = gamesResult.length > 0 
    ? gamesResult[0].values.map(row => {
        const game = {};
        gamesResult[0].columns.forEach((col, i) => game[col] = row[i]);
        return {
          id: game.id,
          title: `vs ${game.opponent}`,
          date: game.game_date,
          type: 'game',
          location: game.location,
          homeAway: game.home_away,
          status: game.status,
          teamScore: game.team_score,
          opponentScore: game.opponent_score,
          opponent: game.opponent
        };
      })
    : [];

  // Fetch practices
  const practicesResult = db.exec('SELECT * FROM practices WHERE team_id = ?', [teamId]);
  const practices = practicesResult.length > 0
    ? practicesResult[0].values.map(row => {
        const practice = {};
        practicesResult[0].columns.forEach((col, i) => practice[col] = row[i]);
        return {
          id: practice.id,
          title: practice.focus || 'Practice',
          date: practice.practice_date,
          type: 'practice',
          focus: practice.focus,
          duration: practice.duration,
          location: practice.location
        };
      })
    : [];

  // Fetch videos (film sessions)
  const videosResult = db.exec('SELECT * FROM videos WHERE team_id = ?', [teamId]);
  const videos = videosResult.length > 0
    ? videosResult[0].values.map(row => {
        const video = {};
        videosResult[0].columns.forEach((col, i) => video[col] = row[i]);
        return {
          id: video.id,
          title: video.title,
          date: video.created_at,
          type: 'film',
          url: video.url,
          gameId: video.game_id
        };
      })
    : [];

  // Combine and sort by date
  const allEvents = [...games, ...practices, ...videos].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return allEvents;
};

module.exports = {
  getCalendarEvents
};
