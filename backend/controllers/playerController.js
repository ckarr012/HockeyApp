const { updatePlayerStatus, getPlayerById } = require('../models/playerModel');

const updateStatus = async (req, res) => {
  try {
    const { playerId } = req.params;
    const { status, injury_note } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const player = await getPlayerById(playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const updatedPlayer = await updatePlayerStatus(playerId, { status, injury_note });
    res.json({ player: updatedPlayer });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  updateStatus
};
