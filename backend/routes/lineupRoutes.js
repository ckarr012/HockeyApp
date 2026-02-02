const express = require('express');
const router = express.Router();
const { getLineups, addLineup, editLineup } = require('../controllers/lineupController');

router.get('/:teamId/lineups', getLineups);
router.post('/:teamId/lineups', addLineup);
router.put('/lineups/:lineupId', editLineup);

module.exports = router;
