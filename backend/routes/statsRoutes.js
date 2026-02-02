const express = require('express');
const router = express.Router();
const { getTeamStats, getGameStats, recordGameStats } = require('../controllers/statsController');

router.get('/:teamId/stats', getTeamStats);
router.get('/games/:gameId/stats', getGameStats);
router.post('/games/:gameId/stats', recordGameStats);

module.exports = router;
