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
    // Transform to camelCase for frontend
    return {
      id: player.id,
      teamId: player.team_id,
      firstName: player.first_name,
      lastName: player.last_name,
      jerseyNumber: player.jersey_number,
      position: player.position,
      birthDate: player.birth_date,
      height: player.height,
      weight: player.weight,
      shoots: player.shoots,
      status: player.status,
      injuryNote: player.injury_note,
      createdAt: player.created_at,
      updatedAt: player.updated_at
    };
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

const createGame = async (teamId, gameData) => {
  const { getDb, saveDb } = require('../db/database');
  const { v4: uuidv4 } = require('uuid');
  
  const db = await getDb();
  const gameId = uuidv4();
  
  db.run(
    `INSERT INTO games (id, team_id, game_date, opponent, location, home_away, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [gameId, teamId, gameData.game_date, gameData.opponent, gameData.location, gameData.home_away, gameData.status || 'scheduled']
  );
  
  await saveDb();
  return gameId;
};

const updateGameScore = async (gameId, teamScore, opponentScore) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run(
    'UPDATE games SET team_score = ?, opponent_score = ?, status = ? WHERE id = ?',
    [teamScore, opponentScore, 'completed', gameId]
  );
  
  await saveDb();
};

const deleteGame = async (gameId) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run('DELETE FROM games WHERE id = ?', [gameId]);
  
  await saveDb();
};

const deleteVideo = async (videoId) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run('DELETE FROM videos WHERE id = ?', [videoId]);
  
  await saveDb();
};

const updateTeamSettings = async (teamId, settings) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  const updates = [];
  const values = [];
  
  if (settings.name !== undefined) {
    updates.push('name = ?');
    values.push(settings.name);
  }
  
  if (settings.season !== undefined) {
    updates.push('season = ?');
    values.push(settings.season);
  }
  
  if (settings.division !== undefined) {
    updates.push('division = ?');
    values.push(settings.division);
  }
  
  if (updates.length === 0) return;
  
  values.push(teamId);
  
  db.run(
    `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  await saveDb();
};

module.exports = {
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
};
