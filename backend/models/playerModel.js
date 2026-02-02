const { getDb, saveDb } = require('../db/database');

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

module.exports = {
  updatePlayerStatus,
  getPlayerById
};
