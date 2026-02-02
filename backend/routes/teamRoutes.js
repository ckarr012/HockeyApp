const express = require('express');
const router = express.Router();
const { getPlayers, getDashboard, getGames } = require('../controllers/teamController');

router.get('/:teamId/players', getPlayers);

router.get('/:teamId/dashboard', getDashboard);

router.get('/:teamId/games', getGames);

module.exports = router;
