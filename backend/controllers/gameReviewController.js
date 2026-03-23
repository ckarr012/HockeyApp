const Anthropic = require('@anthropic-ai/sdk');
const { getGameNotesByGameId, createGameNote, deleteGameNote } = require('../models/gameNotesModel');
const { getStatsByGameId } = require('../models/statsModel');
const { getGamesByTeamId } = require('../models/teamModel');

const getGameNotes = async (req, res) => {
  try {
    const notes = await getGameNotesByGameId(req.params.gameId);
    res.json({ notes });
  } catch (error) {
    console.error('Error in getGameNotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addGameNote = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId, timestampSeconds, note } = req.body;
    if (!note?.trim()) return res.status(400).json({ error: 'Note text is required' });
    const created = await createGameNote(gameId, teamId, timestampSeconds ?? 0, note.trim());
    res.status(201).json({ note: created });
  } catch (error) {
    console.error('Error in addGameNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeGameNote = async (req, res) => {
  try {
    await deleteGameNote(req.params.noteId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in removeGameNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generatePracticePlan = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId, gameInfo } = req.body;

    const [notes, stats] = await Promise.all([
      getGameNotesByGameId(gameId),
      getStatsByGameId(gameId),
    ]);

    const formatTime = (s) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const notesText = notes.length > 0
      ? notes.map(n => `[${formatTime(n.timestampSeconds)}] ${n.note}`).join('\n')
      : 'No timestamped notes recorded.';

    const statsText = stats.length > 0
      ? stats.map(s => `${s.first_name} ${s.last_name} (#${s.jersey_number}, ${s.position}): ${s.goals}G ${s.assists}A ${s.shots} shots ${s.blocks} blocks ${s.pims} PIM`).join('\n')
      : 'No game stats recorded.';

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are an expert ice hockey coaching assistant. Based on the game review data below, generate a detailed practice plan for the next practice.

GAME INFO:
${gameInfo.homeAway === 'home' ? 'Home' : 'Away'} vs ${gameInfo.opponent}
Final Score: ${gameInfo.teamScore ?? '?'} - ${gameInfo.opponentScore ?? '?'} (${gameInfo.status})
Date: ${gameInfo.gameDate}

COACH'S TIMESTAMPED NOTES:
${notesText}

PLAYER STATS:
${statsText}

Generate a comprehensive practice plan. Return ONLY a valid JSON object with NO markdown, NO code fences, just raw JSON:

{
  "summary": "2-3 sentence overview of what this practice addresses based on the game",
  "focusAreas": ["area 1", "area 2", "area 3"],
  "totalDuration": 90,
  "drills": [
    {
      "name": "Drill name",
      "duration": 10,
      "category": "skating|shooting|defensive|offensive|special_teams|conditioning|goalie",
      "description": "Detailed description of how to run the drill",
      "playerFocus": ["player name if specific, or 'All Skaters', 'Defensemen', 'Forwards', etc."],
      "coachingPoints": ["key point 1", "key point 2"]
    }
  ]
}

Make drills specific to the issues identified in the notes and stats. Include 5-8 drills totaling roughly 90 minutes. If there are no notes or stats, create a balanced general practice plan.`,
      }],
    });

    const raw = message.content[0].text.trim();
    let plan;
    try {
      plan = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not generate practice plan. Please try again.' });
    }

    res.json({ plan });
  } catch (error) {
    console.error('Error in generatePracticePlan:', error);
    res.status(500).json({ error: 'Failed to generate practice plan.' });
  }
};

module.exports = { getGameNotes, addGameNote, removeGameNote, generatePracticePlan };
