const express = require('express');
const router = express.Router();
const { getPractices } = require('../controllers/practiceController');

router.get('/:teamId/practices', getPractices);

module.exports = router;
