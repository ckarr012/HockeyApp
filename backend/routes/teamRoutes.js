const express = require('express');
const router = express.Router();
const { getPlayers, addPlayer, getDashboard, getGames, addGame, updateScore, removeGame, removeVideo, updateSettings } = require('../controllers/teamController');
const { getGameNotes, addGameNote, removeGameNote, generatePracticePlan } = require('../controllers/gameReviewController');
const { getOpponentRoster, getOpponentStats } = require('../models/opponentModel');

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

router.get('/:teamId/opponent-roster', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { opponentName } = req.query;
    if (!opponentName) return res.status(400).json({ error: 'opponentName required' });
    const roster = await getOpponentRoster(teamId, opponentName);
    res.json({ roster });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:teamId/opponent-stats', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { opponentName } = req.query;
    if (!opponentName) return res.status(400).json({ error: 'opponentName required' });
    const stats = await getOpponentStats(teamId, opponentName);
    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
