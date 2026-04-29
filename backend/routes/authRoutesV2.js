const express = require('express');
const router = express.Router();
const { register, login, verifyMFA, sendSMSVerification } = require('../controllers/authControllerV2');
const { 
  startMFAEnrollment, 
  completeMFAEnrollment, 
  disableMFAEndpoint,
  getBackupCodes,
  regenerateBackupCodesEndpoint
} = require('../controllers/mfaController');
const authMiddleware = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-mfa', verifyMFA);
router.post('/send-sms', sendSMSVerification);

router.post('/mfa/start', authMiddleware, startMFAEnrollment);
router.post('/mfa/complete', authMiddleware, completeMFAEnrollment);
router.post('/mfa/disable', authMiddleware, disableMFAEndpoint);
router.get('/mfa/backup-codes', authMiddleware, getBackupCodes);
router.post('/mfa/regenerate-backup-codes', authMiddleware, regenerateBackupCodesEndpoint);

module.exports = router;
