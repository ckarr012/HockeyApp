const { 
  createAccount, 
  getAccountByEmail, 
  getAccountByUsername,
  getAccountById,
  verifyPassword,
  updateLastLogin,
  useBackupCode,
  getTeamForAccount,
  linkAccountToTeam
} = require('../models/accountModel');
const { generateToken } = require('../utils/jwt');
const { verifyTOTPToken } = require('../utils/mfa');
const { verifySMSCode, createSMSCode } = require('../models/smsCodeModel');
const { sendMFACode } = require('../utils/sms');
const { generateSMSCode } = require('../utils/mfa');

const buildAccountResponse = async (account) => {
  const team = await getTeamForAccount(account.id);
  return {
    id: account.id,
    email: account.email,
    username: account.username,
    fullName: account.full_name,
    phoneNumber: account.phone_number,
    mfaEnabled: account.mfa_enabled === 1,
    teamId: team ? team.team_id : null,
    teamName: team ? team.team_name : null,
    division: team ? team.division : null,
    season: team ? team.season : null,
    role: team ? team.role : 'coach'
  };
};

const register = async (req, res) => {
  try {
    const { email, username, password, fullName, phoneNumber } = req.body;

    if (!email || !username || !password || !fullName) {
      return res.status(400).json({ error: 'Email, username, password, and full name are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingEmail = await getAccountByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingUsername = await getAccountByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const accountId = await createAccount({
      email,
      username,
      password,
      fullName,
      phoneNumber
    });

    // Auto-link new account to an existing team (Option C)
    await linkAccountToTeam(accountId, fullName);

    const account = await getAccountById(accountId);
    const token = generateToken(accountId);
    const accountResponse = await buildAccountResponse(account);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      account: accountResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }

    let account = await getAccountByEmail(identifier);
    if (!account) {
      account = await getAccountByUsername(identifier);
    }

    if (!account) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await verifyPassword(password, account.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (account.mfa_enabled) {
      return res.json({
        mfa_required: true,
        account_id: account.id,
        mfa_method: account.mfa_method,
        message: 'MFA verification required'
      });
    }

    // Safety net: ensure account is linked to a team (for accounts created before this fix)
    const existingTeam = await getTeamForAccount(account.id);
    if (!existingTeam) {
      await linkAccountToTeam(account.id, account.full_name);
    }

    await updateLastLogin(account.id);
    const token = generateToken(account.id);
    const accountResponse = await buildAccountResponse(account);

    res.json({
      token,
      account: accountResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const verifyMFA = async (req, res) => {
  try {
    const { accountId, code, useBackup } = req.body;

    if (!accountId || !code) {
      return res.status(400).json({ error: 'Account ID and code are required' });
    }

    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    let isValid = false;

    if (useBackup) {
      isValid = await useBackupCode(accountId, code);
    } else if (account.mfa_method === 'totp') {
      isValid = verifyTOTPToken(account.mfa_secret, code);
    } else if (account.mfa_method === 'sms') {
      isValid = await verifySMSCode(accountId, code);
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Safety net: ensure account is linked to a team
    const existingTeam = await getTeamForAccount(account.id);
    if (!existingTeam) {
      await linkAccountToTeam(account.id, account.full_name);
    }

    await updateLastLogin(accountId);
    const token = generateToken(accountId);
    const accountResponse = await buildAccountResponse(account);

    res.json({
      token,
      account: accountResponse
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: 'MFA verification failed' });
  }
};

const sendSMSVerification = async (req, res) => {
  try {
    const { accountId } = req.body;

    if (!accountId) {
      return res.status(400).json({ error: 'Account ID is required' });
    }

    const account = await getAccountById(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    if (!account.phone_number) {
      return res.status(400).json({ error: 'No phone number on file' });
    }

    const code = generateSMSCode();
    await createSMSCode(accountId, account.phone_number, code);
    
    const result = await sendMFACode(account.phone_number, code);
    
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to send SMS code: ' + (result.error || 'unknown error') });
    }

    const response = { message: 'SMS code sent successfully' };
    if (result.devMode) {
      response.devMode = true;
      response.devCode = result.code;
      response.devMessage = 'Twilio not configured. Code shown here for dev testing only.';
    }
    res.json(response);
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ error: 'Failed to send SMS code' });
  }
};

module.exports = {
  register,
  login,
  verifyMFA,
  sendSMSVerification
};
