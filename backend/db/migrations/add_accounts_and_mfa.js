const { getDb, saveDb } = require('../database');

console.log('Running accounts and MFA migration...');

const migrations = [
  // Create accounts table
  `CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    mfa_enabled INTEGER DEFAULT 0,
    mfa_method TEXT,
    mfa_secret TEXT,
    mfa_backup_codes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME
  )`,

  // Add account_id to users table
  `ALTER TABLE users ADD COLUMN account_id TEXT REFERENCES accounts(id)`,

  // Create login attempts table for rate limiting
  `CREATE TABLE IF NOT EXISTS login_attempts (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success INTEGER DEFAULT 0
  )`,

  // Create sessions table
  `CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    token TEXT NOT NULL,
    device_info TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )`,

  // Create MFA verification attempts table
  `CREATE TABLE IF NOT EXISTS mfa_attempts (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    success INTEGER DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )`,

  // Create SMS verification codes table
  `CREATE TABLE IF NOT EXISTS sms_codes (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  )`
];

(async () => {
  try {
    const db = await getDb();
    
    migrations.forEach((migration, index) => {
      try {
        db.run(migration);
        console.log(`✓ Migration ${index + 1} completed`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`✓ Migration ${index + 1} already applied (skipped)`);
        } else {
          throw error;
        }
      }
    });
    
    await saveDb();
    console.log('✅ Accounts and MFA migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
