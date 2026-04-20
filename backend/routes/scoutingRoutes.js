const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport,
  generateAiScoutingReport,
  getScoutedOpponents
} = require('../controllers/scoutingController');

router.get('/:teamId/scouting', getReports);
router.get('/scouting/games/:gameId', getReportByGame);
router.post('/:teamId/scouting', createReport);
router.put('/scouting/:reportId', updateReport);
router.delete('/scouting/:reportId', deleteReport);
router.post('/scouting/ai-generate', generateAiScoutingReport);
router.get('/:teamId/scouted-opponents', getScoutedOpponents);

module.exports = router;
