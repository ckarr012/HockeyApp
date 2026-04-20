const {getDb} = require('./db/database');

(async()=>{
  const db = await getDb();
  
  console.log('=== All distinct opponent_name values ===');
  console.log(JSON.stringify(db.exec('SELECT DISTINCT opponent_name, team_id, COUNT(*) FROM opponent_player_stats GROUP BY opponent_name, team_id'), null, 2));
  
  console.log('\n=== Lindenwood stats for Roosevelt team_id ===');
  console.log(JSON.stringify(db.exec("SELECT player_name, games_played, goals, assists, points FROM opponent_player_stats WHERE team_id='33ce1096-a31f-4d20-9f35-a56b90b087df' AND opponent_name='Lindenwood' ORDER BY points DESC"), null, 2));
  
  console.log('\n=== Raw roster for Lindenwood ===');
  console.log(JSON.stringify(db.exec("SELECT jersey_number, first_name, last_name, position FROM opponent_rosters WHERE team_id='33ce1096-a31f-4d20-9f35-a56b90b087df' AND opponent_name='Lindenwood' LIMIT 10"), null, 2));
})();
