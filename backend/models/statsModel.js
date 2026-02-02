const { getDb, saveDb } = require('../db/database');

const getPlayerStatsByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.jersey_number,
      p.position,
      COALESCE(SUM(ps.goals), 0) as total_goals,
      COALESCE(SUM(ps.assists), 0) as total_assists,
      COALESCE(SUM(ps.goals) + SUM(ps.assists), 0) as total_points,
      COALESCE(SUM(ps.shots), 0) as total_shots,
      COALESCE(SUM(ps.blocks), 0) as total_blocks,
      COALESCE(SUM(ps.pims), 0) as total_pims,
      COUNT(DISTINCT ps.game_id) as games_played
    FROM players p
    LEFT JOIN player_stats ps ON p.id = ps.player_id
    WHERE p.team_id = ?
    GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.position
    ORDER BY total_points DESC, total_goals DESC, p.last_name ASC
  `, [teamId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const stats = {};
    columns.forEach((col, i) => stats[col] = row[i]);
    return stats;
  });
};

const getStatsByGameId = async (gameId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      ps.*,
      p.first_name,
      p.last_name,
      p.jersey_number,
      p.position
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    WHERE ps.game_id = ?
    ORDER BY (ps.goals + ps.assists) DESC
  `, [gameId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const stat = {};
    columns.forEach((col, i) => stat[col] = row[i]);
    return stat;
  });
};

const createPlayerStats = async (statsData) => {
  const db = await getDb();
  const { id, playerId, gameId, goals, assists, shots, blocks, pims } = statsData;
  
  db.run(
    `INSERT INTO player_stats (id, player_id, game_id, goals, assists, shots, blocks, pims) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, playerId, gameId, goals || 0, assists || 0, shots || 0, blocks || 0, pims || 0]
  );
  
  await saveDb();
  return { id, playerId, gameId, goals, assists, shots, blocks, pims };
};

const createBulkPlayerStats = async (statsArray) => {
  const db = await getDb();
  
  statsArray.forEach(stat => {
    db.run(
      `INSERT INTO player_stats (id, player_id, game_id, goals, assists, shots, blocks, pims) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [stat.id, stat.playerId, stat.gameId, stat.goals || 0, stat.assists || 0, stat.shots || 0, stat.blocks || 0, stat.pims || 0]
    );
  });
  
  await saveDb();
  return statsArray;
};

module.exports = {
  getPlayerStatsByTeamId,
  getStatsByGameId,
  createPlayerStats,
  createBulkPlayerStats
};
