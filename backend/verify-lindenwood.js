const {getDb} = require('./db/database');

(async()=>{
  const db = await getDb();
  const r = db.exec(`
    SELECT player_name, games_played, goals, assists, points 
    FROM opponent_player_stats 
    WHERE opponent_name='Lindenwood' 
    ORDER BY points DESC 
    LIMIT 5
  `);
  console.log(JSON.stringify(r, null, 2));
})();
