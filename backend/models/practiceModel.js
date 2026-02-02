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

module.exports = {
  getPracticesByTeamId,
  getDrillsByPracticeId,
  getPracticesWithDrills
};
