const { getDb } = require('./db/database');

async function checkTable() {
  try {
    const db = await getDb();
    const result = db.exec('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('All tables:', result);
    
    const notesTable = db.exec('SELECT name FROM sqlite_master WHERE type="table" AND name="dashboard_notes"');
    console.log('dashboard_notes table exists:', notesTable.length > 0);
    
    if (notesTable.length > 0) {
      const schema = db.exec('SELECT sql FROM sqlite_master WHERE type="table" AND name="dashboard_notes"');
      console.log('Table schema:', schema);
    }
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkTable();
