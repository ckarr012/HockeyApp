const express = require('express');
const router = express.Router();
const { getPractices, createPracticeWithDrills, removePractice } = require('../controllers/practiceController');

router.get('/:teamId/practices', getPractices);
router.post('/:teamId/practices', createPracticeWithDrills);
router.delete('/practices/:practiceId', removePractice);

module.exports = router;
