const { getDb, saveDb } = require('../db/database');

const getGameNotesByGameId = async (gameId) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM game_notes WHERE game_id = ? ORDER BY timestamp_seconds ASC',
    [gameId]
  );
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => obj[col] = row[i]);
    return {
      id: obj.id,
      gameId: obj.game_id,
      teamId: obj.team_id,
      timestampSeconds: obj.timestamp_seconds,
      note: obj.note,
      createdAt: obj.created_at,
    };
  });
};

const createGameNote = async (gameId, teamId, timestampSeconds, note) => {
  const db = await getDb();
  const id = crypto.randomUUID();
  db.run(
    'INSERT INTO game_notes (id, game_id, team_id, timestamp_seconds, note) VALUES (?, ?, ?, ?, ?)',
    [id, gameId, teamId, timestampSeconds, note]
  );
  await saveDb();
  return { id, gameId, teamId, timestampSeconds, note };
};

const deleteGameNote = async (noteId) => {
  const db = await getDb();
  db.run('DELETE FROM game_notes WHERE id = ?', [noteId]);
  await saveDb();
};

module.exports = { getGameNotesByGameId, createGameNote, deleteGameNote };
