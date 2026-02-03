const express = require('express');
const router = express.Router();
const recruitingController = require('../controllers/recruitingController');

router.get('/teams/:teamId/prospects', recruitingController.getProspects);
router.get('/prospects/:prospectId', recruitingController.getProspectDetails);
router.post('/teams/:teamId/prospects', recruitingController.addProspect);
router.put('/prospects/:prospectId', recruitingController.updateProspectDetails);
router.delete('/prospects/:prospectId', recruitingController.removeProspect);

router.post('/prospects/:prospectId/videos', recruitingController.addProspectVideo);
router.delete('/prospect-videos/:videoId', recruitingController.removeProspectVideo);

module.exports = router;
