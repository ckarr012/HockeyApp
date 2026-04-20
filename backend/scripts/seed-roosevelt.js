const { getDb, saveDb } = require('../db/database');
const { syncRoosterRoster, syncRoosterSchedule, syncOpponent } = require('../services/achaSync');
const Anthropic = require('@anthropic-ai/sdk');
const crypto = require('crypto');

const ROOSEVELT_TEAM_ID = '33ce1096-a31f-4d20-9f35-a56b90b087df';
const ROOSEVELT_ACHA_ID = '405';

async function main() {
  console.log('🏒 Starting Roosevelt University Data Seed Script\n');
  console.log('=' .repeat(60));

  try {
    // ========== STEP 1: Rename Team ==========
    console.log('\n📝 STEP 1: Renaming team to Roosevelt University...');
    const db = await getDb();
    
    db.run(
      `UPDATE teams SET name = ?, updated_at = datetime('now') WHERE id = ?`,
      ['Roosevelt University', ROOSEVELT_TEAM_ID]
    );
    await saveDb();
    
    const teamResult = db.exec('SELECT id, name FROM teams WHERE id = ?', [ROOSEVELT_TEAM_ID]);
    if (teamResult.length > 0 && teamResult[0].values.length > 0) {
      const teamName = teamResult[0].values[0][1];
      console.log(`✅ Team renamed: ${teamName}`);
    } else {
      throw new Error('Failed to verify team rename');
    }

    // ========== STEP 2: Sync Roosevelt Roster ==========
    console.log('\n👥 STEP 2: Syncing Roosevelt roster from ACHA...');
    console.log(`   Scraping: https://achahockey.org/stats/roster/${ROOSEVELT_ACHA_ID}/60`);
    
    const rosterResult = await syncRoosterRoster(ROOSEVELT_TEAM_ID, ROOSEVELT_ACHA_ID);
    console.log(`✅ Roster sync complete:`);
    console.log(`   - Inserted: ${rosterResult.inserted} players`);
    console.log(`   - Skipped: ${rosterResult.skipped} duplicates`);
    console.log(`   - Total scraped: ${rosterResult.players.length} players`);

    // ========== STEP 3: Sync Roosevelt Schedule ==========
    console.log('\n📅 STEP 3: Syncing Roosevelt schedule from ACHA...');
    console.log(`   Scraping: https://achahockey.org/stats/schedule/${ROOSEVELT_ACHA_ID}/60`);
    
    const scheduleResult = await syncRoosterSchedule(ROOSEVELT_TEAM_ID, ROOSEVELT_ACHA_ID);
    console.log(`✅ Schedule sync complete:`);
    console.log(`   - Inserted: ${scheduleResult.inserted} games`);
    console.log(`   - Skipped: ${scheduleResult.skipped} duplicates`);
    console.log(`   - Total scraped: ${scheduleResult.games.length} games`);

    // ========== STEP 4: Build Default Lineup ==========
    console.log('\n🏒 STEP 4: Building default lineup...');
    
    // Clean slate: delete existing lineups for this team
    const existingLineupsResult = db.exec('SELECT id FROM lineups WHERE team_id = ?', [ROOSEVELT_TEAM_ID]);
    if (existingLineupsResult.length > 0 && existingLineupsResult[0].values.length > 0) {
      for (const row of existingLineupsResult[0].values) {
        const lineupId = row[0];
        db.run('DELETE FROM lineup_slots WHERE lineup_id = ?', [lineupId]);
        db.run('DELETE FROM lineups WHERE id = ?', [lineupId]);
      }
      await saveDb();
      console.log(`   Deleted ${existingLineupsResult[0].values.length} existing lineup(s)`);
    }

    // Create new lineup
    const lineupId = crypto.randomUUID();
    db.run(
      `INSERT INTO lineups (id, team_id, name, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [lineupId, ROOSEVELT_TEAM_ID, 'Primary Lineup']
    );
    await saveDb();
    console.log(`   Created lineup: Primary Lineup (${lineupId})`);

    // Fetch active skaters grouped by position
    const playersResult = db.exec(
      `SELECT id, first_name, last_name, jersey_number, position 
       FROM players 
       WHERE team_id = ? AND status = 'active' AND position != 'goalie'
       ORDER BY position, jersey_number ASC`,
      [ROOSEVELT_TEAM_ID]
    );

    if (!playersResult.length || !playersResult[0].values.length) {
      throw new Error('No active players found to build lineup');
    }

    const players = playersResult[0].values.map(row => ({
      id: row[0],
      firstName: row[1],
      lastName: row[2],
      jerseyNumber: row[3],
      position: row[4]
    }));

    // Group by position
    const byPosition = {
      center: players.filter(p => p.position === 'center'),
      left_wing: players.filter(p => p.position === 'left_wing'),
      right_wing: players.filter(p => p.position === 'right_wing'),
      left_defense: players.filter(p => p.position === 'left_defense'),
      right_defense: players.filter(p => p.position === 'right_defense')
    };

    console.log(`   Available players by position:`);
    console.log(`   - Centers: ${byPosition.center.length}`);
    console.log(`   - Left Wings: ${byPosition.left_wing.length}`);
    console.log(`   - Right Wings: ${byPosition.right_wing.length}`);
    console.log(`   - Left Defense: ${byPosition.left_defense.length}`);
    console.log(`   - Right Defense: ${byPosition.right_defense.length}`);

    // Build 4 forward lines
    for (let lineNum = 1; lineNum <= 4; lineNum++) {
      const centerIdx = lineNum - 1;
      const lwIdx = lineNum - 1;
      const rwIdx = lineNum - 1;

      const center = byPosition.center[centerIdx] || null;
      const lw = byPosition.left_wing[lwIdx] || null;
      const rw = byPosition.right_wing[rwIdx] || null;

      if (center) {
        db.run(
          `INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), lineupId, `line${lineNum}`, 'center', center.id]
        );
      }
      if (lw) {
        db.run(
          `INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), lineupId, `line${lineNum}`, 'left_wing', lw.id]
        );
      }
      if (rw) {
        db.run(
          `INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), lineupId, `line${lineNum}`, 'right_wing', rw.id]
        );
      }

      const lineStr = [
        center ? `C: #${center.jerseyNumber} ${center.firstName} ${center.lastName}` : 'C: (empty)',
        lw ? `LW: #${lw.jerseyNumber} ${lw.firstName} ${lw.lastName}` : 'LW: (empty)',
        rw ? `RW: #${rw.jerseyNumber} ${rw.firstName} ${rw.lastName}` : 'RW: (empty)'
      ].join(', ');
      console.log(`   Line ${lineNum}: ${lineStr}`);
    }

    // Build 3 defense pairs
    for (let pairNum = 1; pairNum <= 3; pairNum++) {
      const ldIdx = pairNum - 1;
      const rdIdx = pairNum - 1;

      const ld = byPosition.left_defense[ldIdx] || null;
      const rd = byPosition.right_defense[rdIdx] || null;

      if (ld) {
        db.run(
          `INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), lineupId, `defense${pairNum}`, 'left_defense', ld.id]
        );
      }
      if (rd) {
        db.run(
          `INSERT INTO lineup_slots (id, lineup_id, line_type, position, player_id) VALUES (?, ?, ?, ?, ?)`,
          [crypto.randomUUID(), lineupId, `defense${pairNum}`, 'right_defense', rd.id]
        );
      }

      const pairStr = [
        ld ? `LD: #${ld.jerseyNumber} ${ld.firstName} ${ld.lastName}` : 'LD: (empty)',
        rd ? `RD: #${rd.jerseyNumber} ${rd.firstName} ${rd.lastName}` : 'RD: (empty)'
      ].join(', ');
      console.log(`   Pair ${pairNum}: ${pairStr}`);
    }

    await saveDb();
    console.log(`✅ Lineup built successfully`);

    // ========== STEP 5: Scrape Next Opponent ==========
    console.log('\n🔍 STEP 5: Scraping next opponent for matchup testing...');
    
    // Find next scheduled game - now look for opponentTeamId in schedule data
    const nextGameResult = db.exec(
      `SELECT id, opponent, game_date FROM games 
       WHERE team_id = ? AND status = 'scheduled' AND game_date > datetime('now')
       ORDER BY game_date ASC LIMIT 1`,
      [ROOSEVELT_TEAM_ID]
    );

    if (!nextGameResult.length || !nextGameResult[0].values.length) {
      console.log('⚠️  No upcoming scheduled games found. Cannot scrape opponent.');
      console.log('   You can manually add an opponent using the ACHA Sync modal in the app.');
    } else {
      const nextGame = {
        id: nextGameResult[0].values[0][0],
        opponent: nextGameResult[0].values[0][1],
        gameDate: nextGameResult[0].values[0][2]
      };

      console.log(`   Next opponent: ${nextGame.opponent}`);
      console.log(`   Game date: ${new Date(nextGame.gameDate).toLocaleDateString()}`);

      // Try to find opponent team ID from schedule data
      // The schedule scraper now extracts opponentTeamId from links
      // We need to re-scrape to get this data since it wasn't stored in DB
      let opponentAchaId = process.argv[2]; // CLI override
      
      if (!opponentAchaId) {
        console.log('   Looking up opponent ACHA team ID from schedule...');
        try {
          const scheduleData = await syncRoosterSchedule(ROOSEVELT_TEAM_ID, ROOSEVELT_ACHA_ID);
          const gameWithOpponent = scheduleData.games.find(g => 
            g.opponent.toLowerCase().includes(nextGame.opponent.toLowerCase()) ||
            nextGame.opponent.toLowerCase().includes(g.opponent.toLowerCase())
          );
          
          if (gameWithOpponent && gameWithOpponent.opponentTeamId) {
            opponentAchaId = gameWithOpponent.opponentTeamId;
            console.log(`   ✅ Found opponent team ID: ${opponentAchaId}`);
          } else {
            console.log(`   ⚠️  Could not auto-detect opponent team ID from schedule`);
          }
        } catch (lookupError) {
          console.log(`   ⚠️  Failed to lookup opponent ID: ${lookupError.message}`);
        }
      }
      
      if (!opponentAchaId) {
        console.log('\n⚠️  Opponent ACHA team ID not available.');
        console.log(`   To scrape ${nextGame.opponent}, find their ACHA team ID and run:`);
        console.log(`   node scripts/seed-roosevelt.js <opponentAchaTeamId>`);
        console.log('\n   Example: node scripts/seed-roosevelt.js 123');
      } else {
        console.log(`   Using opponent ACHA team ID: ${opponentAchaId}`);
        console.log(`   Scraping ${nextGame.opponent} roster and stats...`);

        try {
          const opponentData = await syncOpponent(ROOSEVELT_TEAM_ID, nextGame.opponent, opponentAchaId);
          console.log(`✅ Opponent data synced:`);
          console.log(`   - Roster: ${opponentData.roster.length} players`);
          console.log(`   - Stats: ${opponentData.stats.length} player stats`);

          // Generate AI scouting report
          console.log(`   Generating AI scouting report...`);
          
          if (!process.env.ANTHROPIC_API_KEY) {
            console.log('⚠️  ANTHROPIC_API_KEY not set. Skipping AI report generation.');
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
                content: `You are an expert ice hockey scouting analyst. Generate a comprehensive scouting report for ${nextGame.opponent} based on their ACHA roster and season stats.

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

            // Save to scouting_reports table
            db.run(
              `INSERT INTO scouting_reports 
               (id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness, created_at, updated_at)
               VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
              [
                crypto.randomUUID(),
                ROOSEVELT_TEAM_ID,
                nextGame.id,
                nextGame.opponent,
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
          }
        } catch (opponentError) {
          console.error(`❌ Failed to scrape opponent: ${opponentError.message}`);
          console.log('   Continuing without opponent data...');
        }
      }
    }

    // ========== STEP 6: Print Test Command ==========
    console.log('\n🧪 STEP 6: Test Command Ready');
    console.log('=' .repeat(60));
    console.log('\nYou can now test the AI Line Matchup Optimizer with:\n');

    const nextGameForTest = db.exec(
      `SELECT opponent FROM games 
       WHERE team_id = ? AND status = 'scheduled' AND game_date > datetime('now')
       ORDER BY game_date ASC LIMIT 1`,
      [ROOSEVELT_TEAM_ID]
    );

    const opponentNameForTest = nextGameForTest.length && nextGameForTest[0].values.length 
      ? nextGameForTest[0].values[0][0] 
      : 'Illinois State';

    console.log(`Invoke-WebRequest -Uri "http://localhost:5000/api/teams/${ROOSEVELT_TEAM_ID}/matchups/generate" \`
  -Method POST \`
  -Headers @{"Content-Type"="application/json"} \`
  -Body '{"teamId":"${ROOSEVELT_TEAM_ID}","lineupId":"${lineupId}","opponentName":"${opponentNameForTest}","gameId":null}' |
  Select-Object -ExpandProperty Content | ConvertFrom-Json | ConvertTo-Json -Depth 10`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Roosevelt University seed script completed successfully!\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
