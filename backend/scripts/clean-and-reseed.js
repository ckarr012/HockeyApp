const { getDb, saveDb } = require('../db/database');
const { syncRoosterRoster } = require('../services/achaSync');

const ROOSEVELT_TEAM_ID = '33ce1096-a31f-4d20-9f35-a56b90b087df';
const ROOSEVELT_ACHA_ID = '405';

async function main() {
  console.log('🧹 Cleaning Roosevelt players and re-seeding with correct positions...\n');
  
  try {
    const db = await getDb();
    
    // Delete all players for Roosevelt
    console.log('Deleting all existing Roosevelt players...');
    db.run('DELETE FROM players WHERE team_id = ?', [ROOSEVELT_TEAM_ID]);
    await saveDb();
    console.log('✅ Players deleted\n');
    
    // Re-sync roster with correct position mapping
    console.log('Re-syncing roster from ACHA...');
    const result = await syncRoosterRoster(ROOSEVELT_TEAM_ID, ROOSEVELT_ACHA_ID);
    
    console.log('\n✅ Re-seed complete!');
    console.log(`   Inserted: ${result.inserted} players`);
    console.log(`   Skipped: ${result.skipped} duplicates`);
    
    // Show final position distribution
    const posResult = db.exec(
      `SELECT position, COUNT(*) as count FROM players WHERE team_id = ? GROUP BY position`,
      [ROOSEVELT_TEAM_ID]
    );
    
    if (posResult.length > 0 && posResult[0].values.length > 0) {
      console.log('\n📊 Final position distribution:');
      posResult[0].values.forEach(row => {
        console.log(`   ${row[0]}: ${row[1]} players`);
      });
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
