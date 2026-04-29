const { getDb, saveDb } = require('../db/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 12;

const createAccount = async (accountData) => {
  const db = await getDb();
  const id = uuidv4();
  const passwordHash = await bcrypt.hash(accountData.password, SALT_ROUNDS);
  
  db.run(`
    INSERT INTO accounts (id, email, username, password_hash, full_name, phone_number)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, accountData.email, accountData.username, passwordHash, accountData.fullName, accountData.phoneNumber || null]);
  
  await saveDb();
  return id;
};

const getAccountByEmail = async (email) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM accounts WHERE email = ?`, [email]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const account = {};
  columns.forEach((col, i) => account[col] = values[i]);
  return account;
};

const getAccountByUsername = async (username) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM accounts WHERE username = ?`, [username]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const account = {};
  columns.forEach((col, i) => account[col] = values[i]);
  return account;
};

const getAccountById = async (id) => {
  const db = await getDb();
  const result = db.exec(`SELECT * FROM accounts WHERE id = ?`, [id]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const account = {};
  columns.forEach((col, i) => account[col] = values[i]);
  return account;
};

const verifyPassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

const updateLastLogin = async (accountId) => {
  const db = await getDb();
  db.run(`UPDATE accounts SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?`, [accountId]);
  await saveDb();
};

const enableMFA = async (accountId, method, secret, backupCodes) => {
  const db = await getDb();
  db.run(`
    UPDATE accounts 
    SET mfa_enabled = 1, mfa_method = ?, mfa_secret = ?, mfa_backup_codes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [method, secret, JSON.stringify(backupCodes), accountId]);
  await saveDb();
};

const disableMFA = async (accountId) => {
  const db = await getDb();
  db.run(`
    UPDATE accounts 
    SET mfa_enabled = 0, mfa_method = NULL, mfa_secret = NULL, mfa_backup_codes = NULL, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [accountId]);
  await saveDb();
};

const updatePhoneNumber = async (accountId, phoneNumber) => {
  const db = await getDb();
  db.run(`UPDATE accounts SET phone_number = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [phoneNumber, accountId]);
  await saveDb();
};

const useBackupCode = async (accountId, code) => {
  const account = await getAccountById(accountId);
  if (!account || !account.mfa_backup_codes) return false;
  
  const backupCodes = JSON.parse(account.mfa_backup_codes);
  const codeIndex = backupCodes.indexOf(code);
  
  if (codeIndex === -1) return false;
  
  backupCodes.splice(codeIndex, 1);
  
  const db = await getDb();
  db.run(`UPDATE accounts SET mfa_backup_codes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
    [JSON.stringify(backupCodes), accountId]);
  await saveDb();
  
  return true;
};

const regenerateBackupCodes = async (accountId, newCodes) => {
  const db = await getDb();
  db.run(`UPDATE accounts SET mfa_backup_codes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, 
    [JSON.stringify(newCodes), accountId]);
  await saveDb();
};

const getTeamForAccount = async (accountId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT users.team_id, users.role, teams.name as team_name, teams.division, teams.season
    FROM users
    JOIN teams ON users.team_id = teams.id
    WHERE users.account_id = ?
    LIMIT 1
  `, [accountId]);

  if (result.length === 0 || result[0].values.length === 0) return null;

  const columns = result[0].columns;
  const values = result[0].values[0];
  const row = {};
  columns.forEach((col, i) => row[col] = values[i]);
  return row;
};

const linkAccountToTeam = async (accountId, fullName) => {
  const db = await getDb();

  // Pick first team in the DB as default
  const teamResult = db.exec(`SELECT id FROM teams LIMIT 1`);
  if (teamResult.length === 0 || teamResult[0].values.length === 0) {
    return null;
  }
  const teamId = teamResult[0].values[0][0];

  // Check if a users row already exists for this account
  const existing = db.exec(`SELECT id FROM users WHERE account_id = ?`, [accountId]);
  if (existing.length > 0 && existing[0].values.length > 0) {
    return teamId;
  }

  const { v4: uuidv4 } = require('uuid');
  const userId = uuidv4();
  // username must be unique - use the account id suffix to avoid collisions
  const username = `user_${accountId.slice(0, 8)}`;
  db.run(`
    INSERT INTO users (id, username, full_name, role, team_id, account_id)
    VALUES (?, ?, ?, 'coach', ?, ?)
  `, [userId, username, fullName, teamId, accountId]);

  await saveDb();
  return teamId;
};

module.exports = {
  createAccount,
  getAccountByEmail,
  getAccountByUsername,
  getAccountById,
  verifyPassword,
  updateLastLogin,
  enableMFA,
  disableMFA,
  updatePhoneNumber,
  useBackupCode,
  regenerateBackupCodes,
  getTeamForAccount,
  linkAccountToTeam
};
