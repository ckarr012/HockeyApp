const { getDb, saveDb } = require('../db/database');

const getLineupsByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      l.*,
      lw.first_name as lw_first_name, lw.last_name as lw_last_name, lw.jersey_number as lw_number,
      c.first_name as c_first_name, c.last_name as c_last_name, c.jersey_number as c_number,
      rw.first_name as rw_first_name, rw.last_name as rw_last_name, rw.jersey_number as rw_number,
      ld.first_name as ld_first_name, ld.last_name as ld_last_name, ld.jersey_number as ld_number,
      rd.first_name as rd_first_name, rd.last_name as rd_last_name, rd.jersey_number as rd_number,
      g.first_name as g_first_name, g.last_name as g_last_name, g.jersey_number as g_number
    FROM lineups l
    LEFT JOIN players lw ON l.lw_id = lw.id
    LEFT JOIN players c ON l.c_id = c.id
    LEFT JOIN players rw ON l.rw_id = rw.id
    LEFT JOIN players ld ON l.ld_id = ld.id
    LEFT JOIN players rd ON l.rd_id = rd.id
    LEFT JOIN players g ON l.g_id = g.id
    WHERE l.team_id = ?
  `, [teamId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const lineup = {};
    columns.forEach((col, i) => lineup[col] = row[i]);
    return lineup;
  });
};

const createLineup = async (lineupData) => {
  const db = await getDb();
  const { id, teamId, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = lineupData;
  
  db.run(
    `INSERT INTO lineups (id, team_id, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, teamId, name, lw_id || null, c_id || null, rw_id || null, ld_id || null, rd_id || null, g_id || null]
  );
  
  await saveDb();
  return { id, teamId, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id };
};

const updateLineup = async (lineupId, lineupData) => {
  const db = await getDb();
  const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = lineupData;
  
  db.run(
    `UPDATE lineups 
     SET name = ?, lw_id = ?, c_id = ?, rw_id = ?, ld_id = ?, rd_id = ?, g_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, lw_id || null, c_id || null, rw_id || null, ld_id || null, rd_id || null, g_id || null, lineupId]
  );
  
  await saveDb();
  return { id: lineupId, ...lineupData };
};

module.exports = {
  getLineupsByTeamId,
  createLineup,
  updateLineup
};
