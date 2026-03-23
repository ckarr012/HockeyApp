const express = require('express');
const router = express.Router();
const {
  syncRoster, syncSchedule, syncStats, syncFromUrl,
  syncOpponentRoster, syncOpponentStats, generateScoutingFromAcha
} = require('../controllers/achaController');

router.get('/roster', syncRoster);
router.get('/schedule', syncSchedule);
router.get('/stats', syncStats);
router.post('/sync-url', syncFromUrl);
router.post('/opponent/roster', syncOpponentRoster);
router.post('/opponent/stats', syncOpponentStats);
router.post('/opponent/generate-scouting', generateScoutingFromAcha);

module.exports = router;
