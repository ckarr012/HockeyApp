const express = require('express');
const router = express.Router();
const { updateStatus, updatePlayerFull, removePlayer, importFromImage, importStatsFromImage } = require('../controllers/playerController');

router.post('/import-from-image', importFromImage);
router.post('/import-stats-from-image', importStatsFromImage);
router.patch('/:playerId/status', updateStatus);
router.put('/:playerId', updatePlayerFull);
router.delete('/:playerId', removePlayer);

module.exports = router;
