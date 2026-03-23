const { getLineupsByTeamId, createLineup, updateLineupSlots, deleteLineup } = require('../models/lineupModel');

const getLineups = async (req, res) => {
  try {
    const lineups = await getLineupsByTeamId(req.params.teamId);
    res.json({ lineups });
  } catch (error) {
    console.error('Error in getLineups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addLineup = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Lineup name is required' });
    const lineup = await createLineup(teamId, name);
    res.status(201).json({ lineup });
  } catch (error) {
    console.error('Error in addLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editLineup = async (req, res) => {
  try {
    const { lineupId } = req.params;
    const { name, slots } = req.body;
    await updateLineupSlots(lineupId, name, slots || {});
    res.json({ success: true });
  } catch (error) {
    console.error('Error in editLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeLineup = async (req, res) => {
  try {
    await deleteLineup(req.params.lineupId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in removeLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getLineups, addLineup, editLineup, removeLineup };
