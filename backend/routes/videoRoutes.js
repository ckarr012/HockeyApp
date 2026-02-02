const express = require('express');
const router = express.Router();
const { getVideos, addVideo } = require('../controllers/videoController');

router.get('/:teamId/videos', getVideos);
router.post('/:teamId/videos', addVideo);

module.exports = router;
