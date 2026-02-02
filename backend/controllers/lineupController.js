const { getLineupsByTeamId, createLineup, updateLineup } = require('../models/lineupModel');
const { v4: uuidv4 } = require('uuid');

const getLineups = async (req, res) => {
  try {
    const { teamId } = req.params;
    const lineups = await getLineupsByTeamId(teamId);
    res.json({ lineups });
  } catch (error) {
    console.error('Error in getLineups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addLineup = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Lineup name is required' });
    }

    const lineupData = {
      id: uuidv4(),
      teamId,
      name,
      lw_id,
      c_id,
      rw_id,
      ld_id,
      rd_id,
      g_id
    };

    const lineup = await createLineup(lineupData);
    res.status(201).json({ lineup });
  } catch (error) {
    console.error('Error in addLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editLineup = async (req, res) => {
  try {
    const { lineupId } = req.params;
    const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = req.body;

    const lineupData = {
      name,
      lw_id,
      c_id,
      rw_id,
      ld_id,
      rd_id,
      g_id
    };

    const lineup = await updateLineup(lineupId, lineupData);
    res.json({ lineup });
  } catch (error) {
    console.error('Error in editLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLineups,
  addLineup,
  editLineup
};
