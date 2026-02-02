const { getCalendarEvents } = require('../models/calendarModel');
const { getTeamById } = require('../models/teamModel');

const getCalendar = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const events = await getCalendarEvents(teamId);
    
    res.json({ events });
  } catch (error) {
    console.error('Error in getCalendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCalendar
};
