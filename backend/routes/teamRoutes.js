const express = require('express');
const router = express.Router();
const { getPlayers, addPlayer, getDashboard, getGames, addGame, updateScore, removeGame, removeVideo, updateSettings } = require('../controllers/teamController');
const { getGameNotes, addGameNote, removeGameNote, generatePracticePlan } = require('../controllers/gameReviewController');

router.get('/:teamId/players', getPlayers);
router.post('/:teamId/players', addPlayer);

router.get('/:teamId/dashboard', getDashboard);

router.get('/:teamId/games', getGames);
router.post('/:teamId/games', addGame);
router.put('/games/:gameId/score', updateScore);
router.delete('/games/:gameId', removeGame);
router.delete('/videos/:videoId', removeVideo);

router.get('/games/:gameId/notes', getGameNotes);
router.post('/games/:gameId/notes', addGameNote);
router.delete('/games/notes/:noteId', removeGameNote);
router.post('/games/:gameId/practice-plan', generatePracticePlan);

router.put('/:teamId/settings', updateSettings);

module.exports = router;
