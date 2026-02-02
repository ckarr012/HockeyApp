const { getDb } = require('../db/database');

const getTeamById = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM teams WHERE id = ?', [teamId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const team = {};
  columns.forEach((col, i) => team[col] = values[i]);
  return team;
};

const getPlayersByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM players WHERE team_id = ?', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const player = {};
    columns.forEach((col, i) => player[col] = row[i]);
    return player;
  });
};

const getGamesByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM games WHERE team_id = ?', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const game = {};
    columns.forEach((col, i) => game[col] = row[i]);
    // Transform to camelCase for frontend
    return {
      id: game.id,
      teamId: game.team_id,
      opponent: game.opponent,
      gameDate: game.game_date,
      location: game.location,
      homeAway: game.home_away,
      status: game.status,
      teamScore: game.team_score,
      opponentScore: game.opponent_score,
      createdAt: game.created_at,
      updatedAt: game.updated_at
    };
  });
};

const getVideosByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM videos WHERE team_id = ?', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const video = {};
    columns.forEach((col, i) => video[col] = row[i]);
    return video;
  });
};

const getPracticesByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM practices WHERE team_id = ?', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const practice = {};
    columns.forEach((col, i) => practice[col] = row[i]);
    return practice;
  });
};

module.exports = {
  getTeamById,
  getPlayersByTeamId,
  getGamesByTeamId,
  getVideosByTeamId,
  getPracticesByTeamId
};
