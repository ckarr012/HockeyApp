const { updatePlayerStatus, getPlayerById, updatePlayerFull: updateFull, deletePlayer } = require('../models/playerModel');
const Anthropic = require('@anthropic-ai/sdk');

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

const updatePlayerFull = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote } = req.body;
    const updated = await updateFull(playerId, { firstName, lastName, jerseyNumber, position, shoots, height, weight, birthDate, status, injuryNote });
    res.json({ player: updated });
  } catch (error) {
    console.error('Error in updatePlayerFull:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removePlayer = async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await getPlayerById(playerId);
    if (!player) return res.status(404).json({ error: 'Player not found' });

    await deletePlayer(playerId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in removePlayer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const importFromImage = async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `You are a hockey roster data extractor. Extract all player information from this roster image and return ONLY a valid JSON array — no explanation, no markdown, no code fences, just raw JSON.

Each player object should have these fields (use null for anything not found):
- firstName (string)
- lastName (string)
- jerseyNumber (number)
- position (one of: "center", "left_wing", "right_wing", "left_defense", "right_defense", "goalie")
- shoots (one of: "left", "right", or null)
- height (number in cm, or null)
- weight (number in kg, or null)
- birthDate (string in YYYY-MM-DD format, or null)
- status (default to "active")

For position, do your best to map common abbreviations: C=center, LW=left_wing, RW=right_wing, LD or LD=left_defense, RD=right_defense, G=goalie.
For height, convert feet/inches to cm if needed (e.g. 6'1" = 185cm).
For weight, convert lbs to kg if needed (e.g. 185lbs = 84kg).

Return ONLY the JSON array.`,
            },
          ],
        },
      ],
    });

    const raw = message.content[0].text.trim();

    let players;
    try {
      players = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not parse player data from image. Please try a clearer photo.' });
    }

    if (!Array.isArray(players)) {
      return res.status(422).json({ error: 'Unexpected response format. Please try again.' });
    }

    res.json({ players });
  } catch (error) {
    console.error('Error in importFromImage:', error);
    res.status(500).json({ error: 'Failed to analyze image.' });
  }
};

const importStatsFromImage = async (req, res) => {
  try {
    const { imageBase64, mediaType, playerNames } = req.body;
    if (!imageBase64 || !mediaType) {
      return res.status(400).json({ error: 'imageBase64 and mediaType are required' });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `You are a hockey stats extractor. Extract player stats from this box score or stat sheet image.

Known players on this team: ${(playerNames || []).join(', ')}

Return ONLY a valid JSON array — no explanation, no markdown, no code fences, just raw JSON.

Each object should have:
- playerName (string — match as closely as possible to the known players list, use full name)
- goals (number, default 0)
- assists (number, default 0)
- shots (number, default 0)
- blocks (number, default 0)
- pims (number — penalty minutes, default 0)

Only include players that appear in the stat sheet. If a stat column is missing, default to 0.
Return ONLY the JSON array.`,
          },
        ],
      }],
    });

    const raw = message.content[0].text.trim();
    let stats;
    try {
      stats = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not parse stats from image. Please try a clearer photo.' });
    }

    if (!Array.isArray(stats)) {
      return res.status(422).json({ error: 'Unexpected response format. Please try again.' });
    }

    res.json({ stats });
  } catch (error) {
    console.error('Error in importStatsFromImage:', error);
    res.status(500).json({ error: 'Failed to analyze image.' });
  }
};

module.exports = {
  updateStatus,
  updatePlayerFull,
  removePlayer,
  importFromImage,
  importStatsFromImage
};
