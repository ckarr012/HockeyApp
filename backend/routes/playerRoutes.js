const express = require('express');
const router = express.Router();
const { updateStatus } = require('../controllers/playerController');

router.patch('/:playerId/status', updateStatus);

module.exports = router;
