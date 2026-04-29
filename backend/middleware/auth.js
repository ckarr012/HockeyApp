const { verifyToken } = require('../utils/jwt');
const { getAccountById } = require('../models/accountModel');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const account = await getAccountById(decoded.accountId);
    
    if (!account) {
      return res.status(401).json({ error: 'Account not found' });
    }

    req.account = account;
    req.accountId = account.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;
