const { getDb, saveDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const getDashboardNotes = async (teamId) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM dashboard_notes WHERE team_id = ? ORDER BY created_at DESC',
    [teamId]
  );
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const note = {};
    columns.forEach((col, i) => note[col] = row[i]);
    return note;
  });
};

const createDashboardNote = async (teamId, noteData) => {
  const db = await getDb();
  const noteId = uuidv4();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO dashboard_notes (id, team_id, title, content, category, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [noteId, teamId, noteData.title, noteData.content, noteData.category || null, now, now]
  );
  
  await saveDb();
  return noteId;
};

const updateDashboardNote = async (noteId, noteData) => {
  const db = await getDb();
  const now = new Date().toISOString();
  
  db.run(
    `UPDATE dashboard_notes 
     SET title = ?, content = ?, category = ?, updated_at = ? 
     WHERE id = ?`,
    [noteData.title, noteData.content, noteData.category || null, now, noteId]
  );
  
  await saveDb();
};

const deleteDashboardNote = async (noteId) => {
  const db = await getDb();
  db.run('DELETE FROM dashboard_notes WHERE id = ?', [noteId]);
  await saveDb();
};

module.exports = {
  getDashboardNotes,
  createDashboardNote,
  updateDashboardNote,
  deleteDashboardNote
};
