const { getDb } = require('../db/database');

const getVideosByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM videos WHERE team_id = ? ORDER BY created_at DESC', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const video = {};
    columns.forEach((col, i) => video[col] = row[i]);
    return video;
  });
};

const createVideo = async (videoData) => {
  const db = await getDb();
  const { id, teamId, title, url, gameId } = videoData;
  
  db.run(
    `INSERT INTO videos (id, team_id, title, url, game_id) VALUES (?, ?, ?, ?, ?)`,
    [id, teamId, title, url || null, gameId || null]
  );
  
  const { saveDb } = require('../db/database');
  await saveDb();
  
  return { id, teamId, title, url, gameId };
};

module.exports = {
  getVideosByTeamId,
  createVideo
};
