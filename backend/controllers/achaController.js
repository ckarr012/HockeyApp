const { scrapeRoster, scrapeSchedule, scrapeStats, extractTeamId } = require('../services/achaScraper');
const { saveOpponentRoster, saveOpponentStats } = require('../models/opponentModel');
const Anthropic = require('@anthropic-ai/sdk');

const ROOSEVELT_TEAM_ID = '405';

const syncRoster = async (req, res) => {
  try {
    const teamId = req.query.teamId || ROOSEVELT_TEAM_ID;
    console.log(`🏒 Scraping ACHA roster for team ${teamId}...`);
    const players = await scrapeRoster(teamId);
    res.json({ players, count: players.length });
  } catch (error) {
    console.error('Error in syncRoster:', error);
    res.status(500).json({ error: 'Failed to scrape roster. The ACHA site may be slow — try again.' });
  }
};

const syncSchedule = async (req, res) => {
  try {
    const teamId = req.query.teamId || ROOSEVELT_TEAM_ID;
    console.log(`📅 Scraping ACHA schedule for team ${teamId}...`);
    const games = await scrapeSchedule(teamId);
    res.json({ games, count: games.length });
  } catch (error) {
    console.error('Error in syncSchedule:', error);
    res.status(500).json({ error: 'Failed to scrape schedule. Try again.' });
  }
};

const syncStats = async (req, res) => {
  try {
    const teamId = req.query.teamId || ROOSEVELT_TEAM_ID;
    console.log(`📊 Scraping ACHA stats for team ${teamId}...`);
    const stats = await scrapeStats(teamId);
    res.json({ stats, count: stats.length });
  } catch (error) {
    console.error('Error in syncStats:', error);
    res.status(500).json({ error: 'Failed to scrape stats. Try again.' });
  }
};

const syncFromUrl = async (req, res) => {
  try {
    const { url, type } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    const teamId = extractTeamId(url);
    if (!teamId) return res.status(400).json({ error: 'Could not extract team ID from URL. Make sure it\'s an ACHA team page URL.' });

    let data;
    if (type === 'roster') {
      data = { players: await scrapeRoster(teamId) };
    } else if (type === 'schedule') {
      data = { games: await scrapeSchedule(teamId) };
    } else if (type === 'stats') {
      data = { stats: await scrapeStats(teamId) };
    } else {
      return res.status(400).json({ error: 'type must be roster, schedule, or stats' });
    }

    res.json({ ...data, teamId });
  } catch (error) {
    console.error('Error in syncFromUrl:', error);
    res.status(500).json({ error: 'Failed to scrape. Try again.' });
  }
};

const syncOpponentRoster = async (req, res) => {
  try {
    const { url, opponentName, teamId } = req.body;
    if (!url || !opponentName || !teamId) {
      return res.status(400).json({ error: 'url, opponentName, and teamId are required' });
    }
    const achaTeamId = extractTeamId(url);
    if (!achaTeamId) return res.status(400).json({ error: 'Invalid ACHA URL' });

    console.log(`🔍 Scraping opponent roster: ${opponentName} (${achaTeamId})`);
    const players = await scrapeRoster(achaTeamId);
    await saveOpponentRoster(teamId, opponentName, achaTeamId, players);
    res.json({ players, count: players.length });
  } catch (error) {
    console.error('Error in syncOpponentRoster:', error);
    res.status(500).json({ error: 'Failed to scrape opponent roster.' });
  }
};

const syncOpponentStats = async (req, res) => {
  try {
    const { url, opponentName, teamId } = req.body;
    if (!url || !opponentName || !teamId) {
      return res.status(400).json({ error: 'url, opponentName, and teamId are required' });
    }
    const achaTeamId = extractTeamId(url);
    if (!achaTeamId) return res.status(400).json({ error: 'Invalid ACHA URL' });

    console.log(`📊 Scraping opponent stats: ${opponentName} (${achaTeamId})`);
    const stats = await scrapeStats(achaTeamId);
    await saveOpponentStats(teamId, opponentName, achaTeamId, stats);
    res.json({ stats, count: stats.length });
  } catch (error) {
    console.error('Error in syncOpponentStats:', error);
    res.status(500).json({ error: 'Failed to scrape opponent stats.' });
  }
};

const generateScoutingFromAcha = async (req, res) => {
  try {
    const { opponentName, teamId, roster, stats } = req.body;
    if (!opponentName) return res.status(400).json({ error: 'opponentName is required' });

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const rosterText = roster?.length > 0
      ? roster.map(p => `#${p.jerseyNumber} ${p.firstName} ${p.lastName} (${p.position})`).join('\n')
      : 'No roster data available';

    const statsText = stats?.length > 0
      ? stats.slice(0, 15).map(s => `${s.playerName}: ${s.goals}G ${s.assists}A ${s.points}PTS in ${s.gamesPlayed}GP`).join('\n')
      : 'No stats data available';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert ice hockey scouting analyst. Generate a comprehensive scouting report for ${opponentName} based on their ACHA roster and season stats.

ROSTER:
${rosterText}

SEASON STATS (top players):
${statsText}

Return ONLY a valid JSON object, no markdown, no code fences:
{
  "strengths": "2-4 sentences about team strengths based on their roster depth and top scorers",
  "weaknesses": "2-4 sentences about potential weaknesses and areas to exploit",
  "powerPlayTendency": "2-3 sentences about likely PP setup based on their forwards and defensemen",
  "goalieWeakness": "2-3 sentences about goalie tendencies (general if no specific data)",
  "tacticalNotes": "3-5 sentences about overall game plan to beat this team",
  "keyPlayers": [
    {
      "name": "player full name",
      "number": 0,
      "position": "position",
      "notes": "why this player is dangerous based on their stats"
    }
  ],
  "lineMatchupSuggestions": "2-3 sentences about suggested line matchups"
}`
      }]
    });

    const raw = message.content[0].text.trim();
    let report;
    try {
      report = JSON.parse(raw);
    } catch {
      return res.status(422).json({ error: 'Could not generate report. Please try again.' });
    }
    res.json({ report });
  } catch (error) {
    console.error('Error in generateScoutingFromAcha:', error);
    res.status(500).json({ error: 'Failed to generate scouting report.' });
  }
};

module.exports = { syncRoster, syncSchedule, syncStats, syncFromUrl, syncOpponentRoster, syncOpponentStats, generateScoutingFromAcha };
