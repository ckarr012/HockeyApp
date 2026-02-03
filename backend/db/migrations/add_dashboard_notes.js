const { getDb, saveDb } = require('../database');

async function up() {
  const db = await getDb();
  
  // Create dashboard_notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS dashboard_notes (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);
  
  await saveDb();
  console.log('✅ Created dashboard_notes table');
}

async function down() {
  const db = await getDb();
  db.run('DROP TABLE IF EXISTS dashboard_notes');
  await saveDb();
  console.log('✅ Dropped dashboard_notes table');
}

module.exports = { up, down };
