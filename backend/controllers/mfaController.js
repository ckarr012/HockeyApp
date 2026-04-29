const { 
  getAccountById, 
  enableMFA, 
  disableMFA,
  verifyPassword,
  regenerateBackupCodes
} = require('../models/accountModel');
const { 
  generateTOTPSecret, 
  verifyTOTPToken, 
  generateQRCode, 
  generateBackupCodes,
  generateSMSCode
} = require('../utils/mfa');
const { createSMSCode } = require('../models/smsCodeModel');
const { sendMFACode } = require('../utils/sms');

const startMFAEnrollment = async (req, res) => {
  try {
    const { method } = req.body;
    const accountId = req.accountId;

    if (!method || !['totp', 'sms'].includes(method)) {
      return res.status(400).json({ error: 'Valid MFA method required (totp or sms)' });
    }

    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (method === 'totp') {
      const secret = generateTOTPSecret(account.email);
      const qrCode = await generateQRCode(secret.otpauth_url);

      res.json({
        method: 'totp',
        secret: secret.base32,
        qrCode,
        manualEntry: secret.base32
      });
    } else if (method === 'sms') {
      if (!account.phone_number) {
        return res.status(400).json({ error: 'Phone number required for SMS MFA' });
      }

      const code = generateSMSCode();
      await createSMSCode(accountId, account.phone_number, code);
      
      const result = await sendMFACode(account.phone_number, code);
      
      if (!result.success) {
        return res.status(500).json({ error: 'Failed to send SMS code: ' + (result.error || 'unknown error') });
      }

      const response = {
        method: 'sms',
        message: 'Verification code sent to your phone'
      };
      if (result.devMode) {
        response.devMode = true;
        response.devCode = result.code;
        response.devMessage = 'Twilio not configured. Code shown here for dev testing only.';
      }
      res.json(response);
    }
  } catch (error) {
    console.error('MFA enrollment start error:', error);
    res.status(500).json({ error: 'Failed to start MFA enrollment' });
  }
};

const completeMFAEnrollment = async (req, res) => {
  try {
    const { method, code, secret } = req.body;
    const accountId = req.accountId;

    if (!method || !code) {
      return res.status(400).json({ error: 'Method and verification code required' });
    }

    let isValid = false;

    if (method === 'totp') {
      if (!secret) {
        return res.status(400).json({ error: 'Secret required for TOTP verification' });
      }
      isValid = verifyTOTPToken(secret, code);
    } else if (method === 'sms') {
      const { verifySMSCode } = require('../models/smsCodeModel');
      isValid = await verifySMSCode(accountId, code);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    const backupCodes = generateBackupCodes();
    await enableMFA(accountId, method, secret || null, backupCodes);

    res.json({
      message: 'MFA enabled successfully',
      backupCodes,
      warning: 'Save these backup codes in a safe place. You will not be able to see them again.'
    });
  } catch (error) {
    console.error('MFA enrollment completion error:', error);
    res.status(500).json({ error: 'Failed to complete MFA enrollment' });
  }
};

const disableMFAEndpoint = async (req, res) => {
  try {
    const { password } = req.body;
    const accountId = req.accountId;

    if (!password) {
      return res.status(400).json({ error: 'Password required to disable MFA' });
    }

    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isValidPassword = await verifyPassword(password, account.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    await disableMFA(accountId);

    res.json({ message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: 'Failed to disable MFA' });
  }
};

const getBackupCodes = async (req, res) => {
  try {
    const accountId = req.accountId;
    const account = await getAccountById(accountId);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is not enabled' });
    }

    const backupCodes = account.mfa_backup_codes ? JSON.parse(account.mfa_backup_codes) : [];

    res.json({ backupCodes });
  } catch (error) {
    console.error('Get backup codes error:', error);
    res.status(500).json({ error: 'Failed to retrieve backup codes' });
  }
};

const regenerateBackupCodesEndpoint = async (req, res) => {
  try {
    const { password } = req.body;
    const accountId = req.accountId;

    if (!password) {
      return res.status(400).json({ error: 'Password required to regenerate backup codes' });
    }

    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    const isValidPassword = await verifyPassword(password, account.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    if (!account.mfa_enabled) {
      return res.status(400).json({ error: 'MFA is not enabled' });
    }

    const newBackupCodes = generateBackupCodes();
    await regenerateBackupCodes(accountId, newBackupCodes);

    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: newBackupCodes,
      warning: 'Old backup codes are no longer valid'
    });
  } catch (error) {
    console.error('Regenerate backup codes error:', error);
    res.status(500).json({ error: 'Failed to regenerate backup codes' });
  }
};

module.exports = {
  startMFAEnrollment,
  completeMFAEnrollment,
  disableMFAEndpoint,
  getBackupCodes,
  regenerateBackupCodesEndpoint
};
