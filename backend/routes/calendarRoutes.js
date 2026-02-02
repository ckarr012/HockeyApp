const express = require('express');
const router = express.Router();
const { getCalendar } = require('../controllers/calendarController');

router.get('/:teamId/calendar', getCalendar);

module.exports = router;
