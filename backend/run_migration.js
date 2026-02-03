const { up } = require('./db/migrations/add_dashboard_notes');

async function runMigration() {
  try {
    await up();
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
  process.exit(0);
}

runMigration();
