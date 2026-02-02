const { getDb } = require('../db/database');

const getUserByUsername = async (username) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT users.*, teams.name as team_name, teams.division, teams.season
    FROM users
    JOIN teams ON users.team_id = teams.id
    WHERE users.username = ?
  `, [username]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const user = {};
  columns.forEach((col, i) => user[col] = values[i]);
  return user;
};

module.exports = {
  getUserByUsername
};
