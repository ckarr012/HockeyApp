const {
  getDashboardNotes,
  createDashboardNote,
  updateDashboardNote,
  deleteDashboardNote
} = require('../models/dashboardNotesModel');

const getNotes = async (req, res) => {
  try {
    const { teamId } = req.params;
    const notes = await getDashboardNotes(teamId);
    res.json({ notes });
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createNote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const noteId = await createDashboardNote(teamId, { title, content, category });
    res.status(201).json({ message: 'Note created successfully', noteId });
  } catch (error) {
    console.error('Error in createNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    await updateDashboardNote(noteId, { title, content, category });
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    await deleteDashboardNote(noteId);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};
