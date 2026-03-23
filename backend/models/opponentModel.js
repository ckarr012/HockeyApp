const { getDb, saveDb } = require('../db/database');
const crypto = require('crypto');

const saveOpponentRoster = async (teamId, opponentName, achaTeamId, players) => {
  const db = await getDb();
  // Clear existing roster for this opponent
  db.run('DELETE FROM opponent_rosters WHERE team_id = ? AND opponent_name = ?', [teamId, opponentName]);
  
  for (const player of players) {
    db.run(
      `INSERT INTO opponent_rosters (id, team_id, opponent_name, acha_team_id, jersey_number, first_name, last_name, position, height, weight, hometown)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), teamId, opponentName, achaTeamId,
       player.jerseyNumber, player.firstName, player.lastName,
       player.position, player.height, player.weight, player.hometown]
    );
  }
  await saveDb();
};

const saveOpponentStats = async (teamId, opponentName, achaTeamId, stats) => {
  const db = await getDb();
  db.run('DELETE FROM opponent_player_stats WHERE team_id = ? AND opponent_name = ?', [teamId, opponentName]);
  
  for (const stat of stats) {
    db.run(
      `INSERT INTO opponent_player_stats (id, team_id, opponent_name, acha_team_id, player_name, games_played, goals, assists, points, pims, shots)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), teamId, opponentName, achaTeamId,
       stat.name, stat.gamesPlayed, stat.goals, stat.assists,
       stat.points, stat.pims, stat.shots]
    );
  }
  await saveDb();
};

const getOpponentRoster = async (teamId, opponentName) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM opponent_rosters WHERE team_id = ? AND opponent_name = ? ORDER BY jersey_number ASC',
    [teamId, opponentName]
  );
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return {
      id: obj.id,
      jerseyNumber: obj.jersey_number,
      firstName: obj.first_name,
      lastName: obj.last_name,
      position: obj.position,
      height: obj.height,
      weight: obj.weight,
      hometown: obj.hometown,
    };
  });
};

const getOpponentStats = async (teamId, opponentName) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM opponent_player_stats WHERE team_id = ? AND opponent_name = ? ORDER BY points DESC',
    [teamId, opponentName]
  );
  if (result.length === 0) return [];
  const cols = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    cols.forEach((col, i) => obj[col] = row[i]);
    return {
      id: obj.id,
      playerName: obj.player_name,
      gamesPlayed: obj.games_played,
      goals: obj.goals,
      assists: obj.assists,
      points: obj.points,
      pims: obj.pims,
      shots: obj.shots,
    };
  });
};

const getAllOpponentNames = async (teamId) => {
  const db = await getDb();
  const result = db.exec(
    `SELECT DISTINCT opponent_name FROM opponent_rosters WHERE team_id = ?
     UNION
     SELECT DISTINCT opponent_name FROM opponent_player_stats WHERE team_id = ?`,
    [teamId, teamId]
  );
  if (result.length === 0) return [];
  return result[0].values.map(row => row[0]);
};

module.exports = { saveOpponentRoster, saveOpponentStats, getOpponentRoster, getOpponentStats, getAllOpponentNames };
