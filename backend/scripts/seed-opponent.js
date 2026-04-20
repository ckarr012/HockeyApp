require('dotenv').config();
const { getDb, saveDb } = require('../db/database');
const { syncOpponent } = require('../services/achaSync');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');

const ROOSEVELT_TEAM_ID = '33ce1096-a31f-4d20-9f35-a56b90b087df';

async function main() {
  const opponentName = process.argv[2];
  const achaTeamId = process.argv[3];

  if (!opponentName || !achaTeamId) {
    console.error('❌ Usage: node scripts/seed-opponent.js "<OpponentName>" <AchaTeamId>');
    console.error('   Example: node scripts/seed-opponent.js "Lindenwood" 395');
    process.exit(1);
  }

  console.log(`🔍 Seeding opponent data for ${opponentName} (ACHA team ${achaTeamId})\n`);
  console.log('='.repeat(60));

  try {
    const db = await getDb();

    // Step 1: Scrape opponent roster
    console.log('\n📋 STEP 1: Scraping opponent roster...');
    console.log(`   URL: https://achahockey.org/stats/roster/${achaTeamId}/60`);
    
    const opponentData = await syncOpponent(ROOSEVELT_TEAM_ID, opponentName, achaTeamId);
    
    console.log(`✅ Roster synced: ${opponentData.roster.length} players`);
    
    // Verify roster was saved
    const rosterCheck = db.exec(
      'SELECT COUNT(*) as count FROM opponent_rosters WHERE team_id = ? AND opponent_name = ?',
      [ROOSEVELT_TEAM_ID, opponentName]
    );
    const rosterCount = rosterCheck[0].values[0][0];
    console.log(`   Database: ${rosterCount} rows in opponent_rosters`);

    // Step 2: Scrape opponent stats
    console.log('\n📊 STEP 2: Scraping opponent stats...');
    console.log(`   URL: https://achahockey.org/stats/player-stats/${achaTeamId}/60`);
    console.log(`✅ Stats synced: ${opponentData.stats.length} player stats`);
    
    // Verify stats were saved
    const statsCheck = db.exec(
      'SELECT COUNT(*) as count FROM opponent_player_stats WHERE team_id = ? AND opponent_name = ?',
      [ROOSEVELT_TEAM_ID, opponentName]
    );
    const statsCount = statsCheck[0].values[0][0];
    console.log(`   Database: ${statsCount} rows in opponent_player_stats`);

    // Show top 5 scorers
    if (opponentData.stats.length > 0) {
      console.log('\n   Top 5 scorers:');
      opponentData.stats.slice(0, 5).forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.name}: ${s.points} pts (${s.goals}G, ${s.assists}A)`);
      });
    }

    // Step 3: Generate AI scouting report
    console.log('\n🤖 STEP 3: Generating AI scouting report...');
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  ANTHROPIC_API_KEY not set. Skipping AI report generation.');
      console.log('   Set the environment variable to enable AI scouting reports.');
    } else {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const rosterText = opponentData.roster.slice(0, 20).map(p => 
        `#${p.jerseyNumber} ${p.firstName} ${p.lastName} (${p.position})`
      ).join('\n');

      const statsText = opponentData.stats.slice(0, 15).map(s => 
        `${s.name}: ${s.goals}G ${s.assists}A ${s.points}PTS in ${s.gamesPlayed}GP`
      ).join('\n');

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `You are an expert ice hockey scouting analyst. Generate a comprehensive scouting report for ${opponentName} based on their ACHA roster and season stats.

ROSTER:
${rosterText}

SEASON STATS (top players):
${statsText}

Return ONLY a valid JSON object, no markdown, no code fences:
{
  "strengths": "2-4 sentences about team strengths",
  "weaknesses": "2-4 sentences about potential weaknesses",
  "powerPlayTendency": "2-3 sentences about likely PP setup",
  "goalieWeakness": "2-3 sentences about goalie tendencies",
  "tacticalNotes": "3-5 sentences about overall game plan",
  "keyPlayers": [
    {"name": "player name", "number": 0, "position": "pos", "notes": "why dangerous"}
  ],
  "lineMatchupSuggestions": "2-3 sentences about line matchups"
}`
        }]
      });

      const reportJson = JSON.parse(message.content[0].text);

      // Create a placeholder game for this opponent if none exists
      let gameId = null;
      const existingGameResult = db.exec(
        'SELECT id FROM games WHERE team_id = ? AND opponent = ? LIMIT 1',
        [ROOSEVELT_TEAM_ID, opponentName]
      );
      
      if (existingGameResult.length > 0 && existingGameResult[0].values.length > 0) {
        gameId = existingGameResult[0].values[0][0];
        console.log(`   Using existing game ID: ${gameId}`);
      } else {
        // Create placeholder game
        gameId = crypto.randomUUID();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
        
        db.run(
          `INSERT INTO games (id, team_id, opponent, game_date, location, home_away, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [gameId, ROOSEVELT_TEAM_ID, opponentName, futureDate.toISOString(), 'TBD', 'home', 'scheduled']
        );
        await saveDb();
        console.log(`   Created placeholder game: ${opponentName} on ${futureDate.toLocaleDateString()}`);
      }

      // Save to scouting_reports table
      db.run(
        `INSERT INTO scouting_reports 
         (id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          crypto.randomUUID(),
          ROOSEVELT_TEAM_ID,
          gameId,
          opponentName,
          reportJson.strengths,
          reportJson.weaknesses,
          JSON.stringify(reportJson.keyPlayers),
          reportJson.tacticalNotes + '\n\n' + reportJson.lineMatchupSuggestions,
          reportJson.powerPlayTendency,
          reportJson.goalieWeakness
        ]
      );
      await saveDb();

      console.log(`✅ AI scouting report generated and saved`);
      
      // Verify report was saved
      const reportCheck = db.exec(
        'SELECT COUNT(*) as count FROM scouting_reports WHERE team_id = ? AND opponent_name = ?',
        [ROOSEVELT_TEAM_ID, opponentName]
      );
      const reportCount = reportCheck[0].values[0][0];
      console.log(`   Database: ${reportCount} row(s) in scouting_reports`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`✅ ${opponentName} opponent data seeded successfully!\n`);
    console.log('📊 Summary:');
    console.log(`   - Opponent roster: ${rosterCount} players`);
    console.log(`   - Opponent stats: ${statsCount} player stats`);
    if (process.env.ANTHROPIC_API_KEY) {
      const reportCheck = db.exec(
        'SELECT COUNT(*) as count FROM scouting_reports WHERE team_id = ? AND opponent_name = ?',
        [ROOSEVELT_TEAM_ID, opponentName]
      );
      const reportCount = reportCheck[0].values[0][0];
      console.log(`   - AI scouting reports: ${reportCount}`);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
