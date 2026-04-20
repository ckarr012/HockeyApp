const express = require('express');
const router = express.Router();
const {
  generateMatchupAnalysis,
  getMatchupAnalyses
} = require('../controllers/matchupController');

router.post('/:teamId/matchups/generate', generateMatchupAnalysis);
router.get('/:teamId/matchups', getMatchupAnalyses);

module.exports = router;
