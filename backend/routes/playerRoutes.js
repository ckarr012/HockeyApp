const express = require('express');
const router = express.Router();
const { updateStatus, updatePlayerFull, removePlayer, importFromImage, importStatsFromImage, getPlayerDevelopment, generatePlayerAiReport } = require('../controllers/playerController');

router.post('/import-from-image', importFromImage);
router.post('/import-stats-from-image', importStatsFromImage);
router.patch('/:playerId/status', updateStatus);
router.put('/:playerId', updatePlayerFull);
router.delete('/:playerId', removePlayer);
router.get('/:playerId/development', getPlayerDevelopment);
router.post('/:playerId/ai-report', generatePlayerAiReport);

module.exports = router;
