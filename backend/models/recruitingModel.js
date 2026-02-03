const { getDb, saveDb } = require('../db/database');

const getProspectsByTeam = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospects WHERE team_id = ? ORDER BY grad_year ASC, scout_rating DESC', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const prospect = {};
    columns.forEach((col, i) => prospect[col] = row[i]);
    // Transform to camelCase for frontend
    return {
      id: prospect.id,
      teamId: prospect.team_id,
      name: prospect.name,
      position: prospect.position,
      gradYear: prospect.grad_year,
      currentTeam: prospect.current_team,
      scoutRating: prospect.scout_rating,
      contactInfo: prospect.contact_info,
      status: prospect.status,
      coachingNotes: prospect.coaching_notes,
      createdAt: prospect.created_at,
      updatedAt: prospect.updated_at
    };
  });
};

const getProspectById = async (prospectId, teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospects WHERE id = ? AND team_id = ?', [prospectId, teamId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const prospect = {};
  columns.forEach((col, i) => prospect[col] = values[i]);
  
  // Transform to camelCase for frontend
  return {
    id: prospect.id,
    teamId: prospect.team_id,
    name: prospect.name,
    position: prospect.position,
    gradYear: prospect.grad_year,
    currentTeam: prospect.current_team,
    scoutRating: prospect.scout_rating,
    contactInfo: prospect.contact_info,
    status: prospect.status,
    coachingNotes: prospect.coaching_notes,
    createdAt: prospect.created_at,
    updatedAt: prospect.updated_at
  };
};

const createProspect = async (prospectData) => {
  const db = await getDb();
  const { id, team_id, name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes } = prospectData;
  
  db.run(
    `INSERT INTO prospects (id, team_id, name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, team_id, name, position, grad_year, current_team || null, scout_rating || null, contact_info || null, status || 'Watching', coaching_notes || null]
  );
  
  await saveDb();
  return { id, ...prospectData };
};

const updateProspect = async (prospectId, prospectData) => {
  const db = await getDb();
  const { name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes } = prospectData;
  
  db.run(
    `UPDATE prospects 
     SET name = ?, position = ?, grad_year = ?, current_team = ?, scout_rating = ?, contact_info = ?, status = ?, coaching_notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, position, grad_year, current_team || null, scout_rating || null, contact_info || null, status, coaching_notes || null, prospectId]
  );
  
  await saveDb();
  return { id: prospectId, ...prospectData };
};

const deleteProspect = async (prospectId) => {
  const db = await getDb();
  db.run('DELETE FROM prospects WHERE id = ?', [prospectId]);
  await saveDb();
};

const getVideosByProspect = async (prospectId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospect_videos WHERE prospect_id = ? ORDER BY created_at DESC', [prospectId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const video = {};
    columns.forEach((col, i) => video[col] = row[i]);
    // Transform to camelCase for frontend
    return {
      id: video.id,
      prospectId: video.prospect_id,
      title: video.title,
      videoUrl: video.video_url,
      createdAt: video.created_at
    };
  });
};

const createProspectVideo = async (videoData) => {
  const db = await getDb();
  const { id, prospect_id, title, video_url } = videoData;
  
  db.run(
    `INSERT INTO prospect_videos (id, prospect_id, title, video_url)
     VALUES (?, ?, ?, ?)`,
    [id, prospect_id, title, video_url]
  );
  
  await saveDb();
  return { id, ...videoData };
};

const deleteProspectVideo = async (videoId) => {
  const db = await getDb();
  db.run('DELETE FROM prospect_videos WHERE id = ?', [videoId]);
  await saveDb();
};

module.exports = {
  getProspectsByTeam,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
  getVideosByProspect,
  createProspectVideo,
  deleteProspectVideo
};
