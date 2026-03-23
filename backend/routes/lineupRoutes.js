const express = require('express');
const router = express.Router();
const { getLineups, addLineup, editLineup, removeLineup } = require('../controllers/lineupController');

router.get('/:teamId/lineups', getLineups);
router.post('/:teamId/lineups', addLineup);
router.put('/lineups/:lineupId', editLineup);
router.delete('/lineups/:lineupId', removeLineup);

module.exports = router;
