const puppeteer = require('puppeteer');

const ACHA_BASE = 'https://www.achahockey.org';

// ACHA stats lag one season behind the current schedule. Season 60 (2025-26) is the
// upcoming/current season for rosters and schedules, but stats for it are not populated
// until the season ends. Season 59 (2024-25) is the most recent season with complete stats data.
const CURRENT_SEASON_ID = 60;  // For rosters + schedule (upcoming games)
const STATS_SEASON_ID = 59;     // For player stats (most recently completed season)

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
    await page.goto(`${ACHA_BASE}/stats/roster/${teamId}/${CURRENT_SEASON_ID}`, {
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
          shoots: text[6] || null,  // Shoots is at index 6, not 3
          height: text[4] || null,
          weight: text[5] ? parseInt(text[5]) || null : null,
          hometown: text[8] || null,  // Hometown is at index 8
        };
      }).filter(p => p && p.firstName);
    });

    // Debug: log raw positions
    console.log('🔍 Raw position values from ACHA:');
    players.forEach(p => {
      console.log(`  #${p.jerseyNumber} ${p.firstName} ${p.lastName}: position="${p.position}" shoots="${p.shoots}"`);
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
    await page.goto(`${ACHA_BASE}/stats/schedule/${teamId}/${CURRENT_SEASON_ID}`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for Angular to render - look for table with data
    await page.waitForSelector('table tbody tr', { timeout: 15000 }).catch(() => {
      console.log('⚠️  No schedule table found - page may be empty or structure changed');
    });

    const games = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 3) return null;
        const text = cells.map(c => c.innerText.trim());

        // Try to parse date (usually first column)
        let gameDate = null;
        try {
          const d = new Date(text[0]);
          if (!isNaN(d)) gameDate = d.toISOString();
        } catch {}

        // Extract opponent and team ID from link
        let opponent = '';
        let opponentTeamId = null;
        const opponentCell = cells[1] || cells[2];
        if (opponentCell) {
          const link = opponentCell.querySelector('a');
          if (link) {
            opponent = link.innerText.trim();
            const href = link.getAttribute('href');
            if (href) {
              const match = href.match(/\/stats\/roster\/(\d+)/);
              if (match) opponentTeamId = match[1];
            }
          } else {
            opponent = opponentCell.innerText.trim();
          }
        }

        // Determine home/away
        const homeAway = opponent.startsWith('@') || text[1]?.includes('@') ? 'away' : 'home';
        opponent = opponent.replace(/^@\s*/, '').trim();

        // Try to parse score
        let teamScore = null;
        let opponentScore = null;
        const scoreText = text[2] || text[3] || '';
        const scoreMatch = scoreText.match(/(\d+)\s*[-–]\s*(\d+)/);
        if (scoreMatch) {
          teamScore = parseInt(scoreMatch[1]);
          opponentScore = parseInt(scoreMatch[2]);
        }

        return {
          gameDate,
          opponent,
          opponentTeamId,
          homeAway,
          location: text[3] || text[4] || '',
          teamScore,
          opponentScore,
          status: teamScore !== null ? 'completed' : 'scheduled',
        };
      }).filter(g => g && g.opponent && g.gameDate);
    });

    console.log(`🔍 Schedule scraper found ${games.length} games`);
    if (games.length > 0) {
      console.log('   Sample game:', games[0]);
    }

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
      `${ACHA_BASE}/stats/player-stats/${teamId}/${STATS_SEASON_ID}?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1`,
      { waitUntil: 'networkidle2', timeout: 30000 }
    );

    await page.waitForSelector('table', { timeout: 15000 });

    const stats = await page.evaluate(() => {
      // ACHA uses an unusual table structure: headers are <th> elements in <tbody>, not in <thead>
      // Find the first row with <th> elements (header row)
      const allRows = Array.from(document.querySelectorAll('table tbody tr'));
      const headerRow = allRows.find(row => row.querySelector('th'));
      const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.innerText.trim().toUpperCase()) : [];
      
      // Map common header variations to field names
      // Use exact match to avoid matching 'G' in 'JERSEY #' or 'GP'
      const findColumn = (variations) => {
        for (const variant of variations) {
          const idx = headers.findIndex(h => h === variant || h === variant + '.');
          if (idx !== -1) return idx;
        }
        return -1;
      };
      
      const columnMap = {
        jersey: findColumn(['JERSEY #', 'JERSEY', '#', 'NO', 'NUM']),
        name: findColumn(['NAME', 'PLAYER']),
        gp: findColumn(['GP', 'GAMES PLAYED', 'GAMES']),
        goals: findColumn(['GOALS', 'G']),
        assists: findColumn(['ASSISTS', 'A']),
        points: findColumn(['POINTS', 'PTS', 'P']),
        pims: findColumn(['PENALTY MINUTES', 'PIMS', 'PIM']),
        shots: findColumn(['SHOTS', 'SOG', 'S']),
      };
      
      // Log headers if any expected column is missing
      const missingColumns = Object.entries(columnMap).filter(([k, v]) => v === -1).map(([k]) => k);
      if (missingColumns.length > 0) {
        console.warn('⚠️  Missing columns:', missingColumns);
        console.warn('   Available headers:', headers);
      }
      
      // Filter out header rows and empty rows, only process data rows with <td> elements
      const dataRows = allRows.filter(row => row.querySelector('td') && row.querySelectorAll('td').length >= 5);
      
      return dataRows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const text = cells.map(c => c.innerText.trim());
        
        return {
          jerseyNumber: columnMap.jersey !== -1 ? (parseInt(text[columnMap.jersey]) || 0) : 0,
          name: columnMap.name !== -1 ? text[columnMap.name] : '',
          gamesPlayed: columnMap.gp !== -1 ? (parseInt(text[columnMap.gp]) || 0) : 0,
          goals: columnMap.goals !== -1 ? (parseInt(text[columnMap.goals]) || 0) : 0,
          assists: columnMap.assists !== -1 ? (parseInt(text[columnMap.assists]) || 0) : 0,
          points: columnMap.points !== -1 ? (parseInt(text[columnMap.points]) || 0) : 0,
          pims: columnMap.pims !== -1 ? (parseInt(text[columnMap.pims]) || 0) : 0,
          shots: columnMap.shots !== -1 ? (parseInt(text[columnMap.shots]) || 0) : 0,
        };
      }).filter(s => s && s.name);
    });

    // Sanity check logging
    console.log(`\n📊 Stats Scraper Results (Season ${STATS_SEASON_ID}):`);
    console.log(`   Total rows parsed: ${stats.length}`);
    
    if (stats.length > 0) {
      const topPlayers = stats.sort((a, b) => b.points - a.points).slice(0, 3);
      console.log('   Top 3 players by points:');
      topPlayers.forEach((p, i) => {
        console.log(`     ${i + 1}. ${p.name}: ${p.goals}G + ${p.assists}A = ${p.points}PTS`);
      });
      
      const zeroStatPlayers = stats.filter(p => p.goals === 0 && p.assists === 0 && p.points === 0);
      const zeroPercent = Math.round((zeroStatPlayers.length / stats.length) * 100);
      console.log(`   Players with all-zero stats: ${zeroStatPlayers.length}/${stats.length} (${zeroPercent}%)`);
      
      if (zeroPercent > 50) {
        console.warn('   ⚠️  WARNING: More than 50% of players have zero stats - scraper may still be broken!');
      }
    } else {
      console.warn('   ⚠️  WARNING: No stats rows parsed - check season ID or page structure');
    }

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
