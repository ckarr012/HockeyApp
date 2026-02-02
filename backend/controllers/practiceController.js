const { getPracticesWithDrills } = require('../models/practiceModel');

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

module.exports = {
  getPractices
};
