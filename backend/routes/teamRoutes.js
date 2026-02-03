const express = require('express');
const router = express.Router();
const { getPlayers, getDashboard, getGames, addGame, updateScore, removeGame, removeVideo, updateSettings } = require('../controllers/teamController');

router.get('/:teamId/players', getPlayers);

router.get('/:teamId/dashboard', getDashboard);

router.get('/:teamId/games', getGames);
router.post('/:teamId/games', addGame);
router.put('/games/:gameId/score', updateScore);
router.delete('/games/:gameId', removeGame);
router.delete('/videos/:videoId', removeVideo);

router.put('/:teamId/settings', updateSettings);

module.exports = router;
