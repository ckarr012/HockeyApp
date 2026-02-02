const { getVideosByTeamId, createVideo } = require('../models/videoModel');
const { v4: uuidv4 } = require('uuid');

const getVideos = async (req, res) => {
  try {
    const { teamId } = req.params;
    const videos = await getVideosByTeamId(teamId);
    res.json({ videos });
  } catch (error) {
    console.error('Error in getVideos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addVideo = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, url, gameId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const videoData = {
      id: uuidv4(),
      teamId,
      title,
      url: url || null,
      gameId: gameId || null
    };

    const video = await createVideo(videoData);
    res.status(201).json({ video });
  } catch (error) {
    console.error('Error in addVideo:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getVideos,
  addVideo
};
