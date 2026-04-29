const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hockey-app-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

const generateToken = (accountId) => {
  return jwt.sign({ accountId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};
