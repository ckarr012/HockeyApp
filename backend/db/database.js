const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'hockey.db');
let db = null;

const getDb = async () => {
  if (db) return db;

  const SQL = await initSqlJs();
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
};

const saveDb = async () => {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbPath, data);
};

module.exports = { getDb, saveDb };
