const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/dashboardNotesController');

router.get('/:teamId/notes', getNotes);
router.post('/:teamId/notes', createNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

module.exports = router;
