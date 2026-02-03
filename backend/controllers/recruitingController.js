const { v4: uuidv4 } = require('uuid');
const recruitingModel = require('../models/recruitingModel');

const getProspects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const prospects = await recruitingModel.getProspectsByTeam(teamId);
    res.json({ prospects });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
};

const getProspectDetails = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId } = req.query;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    const prospect = await recruitingModel.getProspectById(prospectId, teamId);
    
    if (!prospect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const videos = await recruitingModel.getVideosByProspect(prospectId);
    
    res.json({ 
      prospect,
      videos
    });
  } catch (error) {
    console.error('Error fetching prospect details:', error);
    res.status(500).json({ error: 'Failed to fetch prospect details' });
  }
};

const addProspect = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, position, gradYear, currentTeam, scoutRating, contactInfo, status, coachingNotes } = req.body;
    
    if (!name || !position || !gradYear) {
      return res.status(400).json({ error: 'Name, position, and graduation year are required' });
    }
    
    if (scoutRating && (scoutRating < 1 || scoutRating > 5)) {
      return res.status(400).json({ error: 'Scout rating must be between 1 and 5' });
    }
    
    const validStatuses = ['Watching', 'Contacted', 'Offered', 'Committed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const prospectData = {
      id: uuidv4(),
      team_id: teamId,
      name,
      position,
      grad_year: gradYear,
      current_team: currentTeam,
      scout_rating: scoutRating,
      contact_info: contactInfo,
      status: status || 'Watching',
      coaching_notes: coachingNotes
    };
    
    const newProspect = await recruitingModel.createProspect(prospectData);
    res.status(201).json({ prospect: newProspect });
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: 'Failed to create prospect' });
  }
};

const updateProspectDetails = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId, name, position, gradYear, currentTeam, scoutRating, contactInfo, status, coachingNotes } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    // Verify ownership
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    if (scoutRating && (scoutRating < 1 || scoutRating > 5)) {
      return res.status(400).json({ error: 'Scout rating must be between 1 and 5' });
    }
    
    const validStatuses = ['Watching', 'Contacted', 'Offered', 'Committed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const prospectData = {
      name,
      position,
      grad_year: gradYear,
      current_team: currentTeam,
      scout_rating: scoutRating,
      contact_info: contactInfo,
      status,
      coaching_notes: coachingNotes
    };
    
    const updatedProspect = await recruitingModel.updateProspect(prospectId, prospectData);
    res.json({ prospect: updatedProspect });
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({ error: 'Failed to update prospect' });
  }
};

const removeProspect = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId } = req.query;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    // Verify ownership
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    await recruitingModel.deleteProspect(prospectId);
    res.json({ message: 'Prospect deleted successfully' });
  } catch (error) {
    console.error('Error deleting prospect:', error);
    res.status(500).json({ error: 'Failed to delete prospect' });
  }
};

const addProspectVideo = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId, title, videoUrl } = req.body;
    
    if (!teamId || !title || !videoUrl) {
      return res.status(400).json({ error: 'teamId, title, and videoUrl are required' });
    }
    
    // Verify ownership
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const videoData = {
      id: uuidv4(),
      prospect_id: prospectId,
      title,
      video_url: videoUrl
    };
    
    const newVideo = await recruitingModel.createProspectVideo(videoData);
    res.status(201).json({ video: newVideo });
  } catch (error) {
    console.error('Error adding prospect video:', error);
    res.status(500).json({ error: 'Failed to add prospect video' });
  }
};

const removeProspectVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    await recruitingModel.deleteProspectVideo(videoId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {
  getProspects,
  getProspectDetails,
  addProspect,
  updateProspectDetails,
  removeProspect,
  addProspectVideo,
  removeProspectVideo
};
