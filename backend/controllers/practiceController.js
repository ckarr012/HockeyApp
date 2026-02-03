const { getPracticesWithDrills, createPractice, createDrill, deletePractice } = require('../models/practiceModel');

const getPractices = async (req, res) => {
  try {
    const { teamId } = req.params;
    const practices = await getPracticesWithDrills(teamId);
    res.json({ practices });
  } catch (error) {
    console.error('Error in getPractices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPracticeWithDrills = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { practice_date, focus, duration, location, drills } = req.body;
    
    // Create the practice
    const practiceId = await createPractice(teamId, {
      practice_date,
      focus,
      duration,
      location
    });
    
    // Create drills if provided
    if (drills && drills.length > 0) {
      for (let i = 0; i < drills.length; i++) {
        await createDrill(practiceId, {
          name: drills[i].name,
          duration: drills[i].duration,
          description: drills[i].description,
          drill_order: i + 1
        });
      }
    }
    
    res.status(201).json({ message: 'Practice created successfully', practiceId });
  } catch (error) {
    console.error('Error in createPracticeWithDrills:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removePractice = async (req, res) => {
  try {
    const { practiceId } = req.params;
    await deletePractice(practiceId);
    res.json({ message: 'Practice deleted successfully' });
  } catch (error) {
    console.error('Error in removePractice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPractices,
  createPracticeWithDrills,
  removePractice
};
