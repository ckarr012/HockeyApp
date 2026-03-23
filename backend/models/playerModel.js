const { getDb, saveDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const createPlayer = async (teamId, playerData) => {
  const db = await getDb();
  const id = uuidv4();
  const { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote } = playerData;

  db.run(
    `INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, shoots, height, weight, birth_date, status, injury_note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, teamId, firstName, lastName, jerseyNumber, position, shoots ?? null, height ?? null, weight ?? null, birthDate ?? null, status, injuryNote ?? null]
  );
  await saveDb();

  return {
    id,
    teamId,
    firstName,
    lastName,
    jerseyNumber,
    position,
    shoots: shoots ?? null,
    height: height ?? null,
    weight: weight ?? null,
    birthDate: birthDate ?? null,
    status,
    injuryNote: injuryNote ?? null,
  };
};

const updatePlayerStatus = async (playerId, statusData) => {
  const db = await getDb();
  const { status, injury_note } = statusData;
  
  db.run(
    `UPDATE players 
     SET status = ?, injury_note = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [status, injury_note || null, playerId]
  );
  
  await saveDb();
  return { id: playerId, status, injury_note };
};

const getPlayerById = async (playerId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM players WHERE id = ?', [playerId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const player = {};
  columns.forEach((col, i) => player[col] = values[i]);
  return player;
};

const updatePlayerFull = async (playerId, data) => {
  const db = await getDb();
  const { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote } = data;
  db.run(
    `UPDATE players SET first_name=?, last_name=?, jersey_number=?, position=?, shoots=?, height=?, weight=?, birth_date=?, status=?, injury_note=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [firstName, lastName, jerseyNumber, position, shoots ?? null, height ?? null, weight ?? null, birthDate ?? null, status, injuryNote ?? null, playerId]
  );
  await saveDb();
  return { id: playerId, firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote };
};

const deletePlayer = async (playerId) => {
  const db = await getDb();
  db.run(`DELETE FROM players WHERE id = ?`, [playerId]);
  await saveDb();
};

module.exports = {
  createPlayer,
  updatePlayerStatus,
  getPlayerById,
  updatePlayerFull,
  deletePlayer
};
