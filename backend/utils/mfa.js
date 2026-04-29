const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

const generateTOTPSecret = (email) => {
  return speakeasy.generateSecret({
    name: `Hockey Coach Pro (${email})`,
    length: 32
  });
};

const verifyTOTPToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw error;
  }
};

const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

const generateSMSCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateTOTPSecret,
  verifyTOTPToken,
  generateQRCode,
  generateBackupCodes,
  generateSMSCode
};
