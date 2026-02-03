const { getDb } = require('../db/database');

const getPracticesByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM practices WHERE team_id = ? ORDER BY practice_date ASC',
    [teamId]
  );
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const practice = {};
    columns.forEach((col, i) => practice[col] = row[i]);
    return practice;
  });
};

const getDrillsByPracticeId = async (practiceId) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM drills WHERE practice_id = ? ORDER BY drill_order ASC',
    [practiceId]
  );
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const drill = {};
    columns.forEach((col, i) => drill[col] = row[i]);
    return drill;
  });
};

const getPracticesWithDrills = async (teamId) => {
  const practices = await getPracticesByTeamId(teamId);
  
  const practicesWithDrills = await Promise.all(
    practices.map(async (practice) => {
      const drills = await getDrillsByPracticeId(practice.id);
      return { ...practice, drills };
    })
  );
  
  return practicesWithDrills;
};

const createPractice = async (teamId, practiceData) => {
  const { getDb, saveDb } = require('../db/database');
  const { v4: uuidv4 } = require('uuid');
  
  const db = await getDb();
  const practiceId = uuidv4();
  
  db.run(
    `INSERT INTO practices (id, team_id, practice_date, focus, duration, location) VALUES (?, ?, ?, ?, ?, ?)`,
    [practiceId, teamId, practiceData.practice_date, practiceData.focus, practiceData.duration, practiceData.location]
  );
  
  await saveDb();
  return practiceId;
};

const createDrill = async (practiceId, drillData) => {
  const { getDb, saveDb } = require('../db/database');
  const { v4: uuidv4 } = require('uuid');
  
  const db = await getDb();
  const drillId = uuidv4();
  
  db.run(
    `INSERT INTO drills (id, practice_id, name, duration, description, drill_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [drillId, practiceId, drillData.name, drillData.duration, drillData.description, drillData.drill_order]
  );
  
  await saveDb();
  return drillId;
};

const deletePractice = async (practiceId) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  // Delete associated drills first
  db.run('DELETE FROM drills WHERE practice_id = ?', [practiceId]);
  
  // Delete the practice
  db.run('DELETE FROM practices WHERE id = ?', [practiceId]);
  
  await saveDb();
};

const deleteDrill = async (drillId) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run('DELETE FROM drills WHERE id = ?', [drillId]);
  
  await saveDb();
};

module.exports = {
  getPracticesByTeamId,
  getDrillsByPracticeId,
  getPracticesWithDrills,
  createPractice,
  createDrill,
  deletePractice,
  deleteDrill
};
