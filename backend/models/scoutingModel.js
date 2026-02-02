const { getDb, saveDb } = require('../db/database');

const getScoutingReportsByTeam = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE team_id = ? ORDER BY date DESC', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const report = {};
    columns.forEach((col, i) => report[col] = row[i]);
    // Transform to camelCase for frontend
    return {
      id: report.id,
      teamId: report.team_id,
      gameId: report.game_id,
      opponentName: report.opponent_name,
      date: report.date,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      keyPlayersJson: report.key_players_json,
      tacticalNotes: report.tactical_notes,
      powerPlayTendency: report.power_play_tendency,
      goalieWeakness: report.goalie_weakness,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    };
  });
};

const getScoutingReportByGame = async (gameId, teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE game_id = ? AND team_id = ?', [gameId, teamId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const report = {};
  columns.forEach((col, i) => report[col] = values[i]);
  
  // Transform to camelCase for frontend
  return {
    id: report.id,
    teamId: report.team_id,
    gameId: report.game_id,
    opponentName: report.opponent_name,
    date: report.date,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    keyPlayersJson: report.key_players_json,
    tacticalNotes: report.tactical_notes,
    powerPlayTendency: report.power_play_tendency,
    goalieWeakness: report.goalie_weakness,
    createdAt: report.created_at,
    updatedAt: report.updated_at
  };
};

const getScoutingReportById = async (reportId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE id = ?', [reportId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const report = {};
  columns.forEach((col, i) => report[col] = values[i]);
  
  // Transform to camelCase for frontend
  return {
    id: report.id,
    teamId: report.team_id,
    gameId: report.game_id,
    opponentName: report.opponent_name,
    date: report.date,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    keyPlayersJson: report.key_players_json,
    tacticalNotes: report.tactical_notes,
    powerPlayTendency: report.power_play_tendency,
    goalieWeakness: report.goalie_weakness,
    createdAt: report.created_at,
    updatedAt: report.updated_at
  };
};

const createScoutingReport = async (reportData) => {
  const db = await getDb();
  const { id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness } = reportData;
  
  db.run(
    `INSERT INTO scouting_reports (id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, team_id, game_id, opponent_name, date, strengths || null, weaknesses || null, key_players_json || null, tactical_notes || null, power_play_tendency || null, goalie_weakness || null]
  );
  
  await saveDb();
  return { id, ...reportData };
};

const updateScoutingReport = async (reportId, reportData) => {
  const db = await getDb();
  const { strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness } = reportData;
  
  db.run(
    `UPDATE scouting_reports 
     SET strengths = ?, weaknesses = ?, key_players_json = ?, tactical_notes = ?, power_play_tendency = ?, goalie_weakness = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [strengths || null, weaknesses || null, key_players_json || null, tactical_notes || null, power_play_tendency || null, goalie_weakness || null, reportId]
  );
  
  await saveDb();
  return { id: reportId, ...reportData };
};

const deleteScoutingReport = async (reportId) => {
  const db = await getDb();
  db.run('DELETE FROM scouting_reports WHERE id = ?', [reportId]);
  await saveDb();
};

module.exports = {
  getScoutingReportsByTeam,
  getScoutingReportByGame,
  getScoutingReportById,
  createScoutingReport,
  updateScoutingReport,
  deleteScoutingReport
};
