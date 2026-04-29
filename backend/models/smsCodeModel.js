const { getDb, saveDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const createSMSCode = async (accountId, phoneNumber, code) => {
  const db = await getDb();
  const id = uuidv4();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  db.run(`
    INSERT INTO sms_codes (id, account_id, phone_number, code, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `, [id, accountId, phoneNumber, code, expiresAt]);
  
  await saveDb();
  return id;
};

const verifySMSCode = async (accountId, code) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT * FROM sms_codes 
    WHERE account_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now')
    ORDER BY created_at DESC
    LIMIT 1
  `, [accountId, code]);
  
  if (result.length === 0 || result[0].values.length === 0) return false;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const smsCode = {};
  columns.forEach((col, i) => smsCode[col] = values[i]);
  
  db.run(`UPDATE sms_codes SET used = 1 WHERE id = ?`, [smsCode.id]);
  await saveDb();
  
  return true;
};

const cleanupExpiredCodes = async () => {
  const db = await getDb();
  db.run(`DELETE FROM sms_codes WHERE expires_at < datetime('now')`);
  await saveDb();
};

module.exports = {
  createSMSCode,
  verifySMSCode,
  cleanupExpiredCodes
};
