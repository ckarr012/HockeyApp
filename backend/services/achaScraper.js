const puppeteer = require('puppeteer');

const ACHA_BASE = 'https://www.achahockey.org';
const SEASON_ID = 60;

const launchBrowser = async () => {
  return puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
};

const scrapeRoster = async (teamId) => {
  let browser;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(`${ACHA_BASE}/stats/roster/${teamId}/${SEASON_ID}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for the roster table to appear
    await page.waitForSelector('table', { timeout: 15000 });

    const players = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 3) return null;
        const text = cells.map(c => c.innerText.trim());
        return {
          jerseyNumber: text[0] ? parseInt(text[0]) || 0 : 0,
          firstName: text[1] ? text[1].split(' ')[0] : '',
          lastName: text[1] ? text[1].split(' ').slice(1).join(' ') : '',
          position: text[2] || '',
          height: text[4] || null,
          weight: text[5] ? parseInt(text[5]) || null : null,
          hometown: text[6] || null,
        };
      }).filter(p => p && p.firstName);
    });

    return players;
  } catch (error) {
    console.error('Error scraping roster:', error.message);
    throw error;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError.message);
      }
    }
  }
};

const scrapeSchedule = async (teamId) => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(`${ACHA_BASE}/stats/schedule/${teamId}/${SEASON_ID}/all-months`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForSelector('table', { timeout: 15000 });

    const games = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 3) return null;
        const text = cells.map(c => c.innerText.trim());

        // Try to parse date
        let gameDate = null;
        try {
          const d = new Date(text[0]);
          if (!isNaN(d)) gameDate = d.toISOString();
        } catch {}

        // Determine home/away and opponent
        const opponentText = text[2] || text[1] || '';
        const homeAway = opponentText.startsWith('@') ? 'away' : 'home';
        const opponent = opponentText.replace(/^@\s*/, '').trim();

        // Try to parse score
        let teamScore = null;
        let opponentScore = null;
        const scoreText = text[3] || text[4] || '';
        const scoreMatch = scoreText.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (scoreMatch) {
          teamScore = parseInt(scoreMatch[1]);
          opponentScore = parseInt(scoreMatch[2]);
        }

        return {
          gameDate,
          opponent,
          homeAway,
          location: text[homeAway === 'away' ? 2 : 3] || '',
          teamScore,
          opponentScore,
          status: teamScore !== null ? 'completed' : 'scheduled',
        };
      }).filter(g => g && g.opponent && g.gameDate);
    });

    return games;
  } finally {
    await browser.close();
  }
};

const scrapeStats = async (teamId) => {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(
      `${ACHA_BASE}/stats/player-stats/${teamId}/${SEASON_ID}?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1`,
      { waitUntil: 'networkidle2', timeout: 30000 }
    );

    await page.waitForSelector('table', { timeout: 15000 });

    const stats = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 5) return null;
        const text = cells.map(c => c.innerText.trim());
        return {
          name: text[1] || '',
          gamesPlayed: parseInt(text[2]) || 0,
          goals: parseInt(text[3]) || 0,
          assists: parseInt(text[4]) || 0,
          points: parseInt(text[5]) || 0,
          pims: parseInt(text[7]) || 0,
          shots: parseInt(text[8]) || 0,
        };
      }).filter(s => s && s.name);
    });

    return stats;
  } finally {
    await browser.close();
  }
};

// Extract team ID from any ACHA URL
const extractTeamId = (url) => {
  const match = url.match(/\/stats\/(?:roster|schedule|player-stats)\/(\d+)/);
  return match ? match[1] : null;
};

module.exports = { scrapeRoster, scrapeSchedule, scrapeStats, extractTeamId };
