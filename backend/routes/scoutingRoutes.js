const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/scoutingController');

router.get('/:teamId/scouting', getReports);
router.get('/scouting/games/:gameId', getReportByGame);
router.post('/:teamId/scouting', createReport);
router.put('/scouting/:reportId', updateReport);
router.delete('/scouting/:reportId', deleteReport);

module.exports = router;
