const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  await page.goto(
    'https://www.achahockey.org/stats/player-stats/395/59?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1',
    { waitUntil: 'networkidle2', timeout: 30000 }
  );
  
  await page.waitForSelector('table', { timeout: 15000 });
  
  const result = await page.evaluate(() => {
    const allRows = Array.from(document.querySelectorAll('table tbody tr'));
    const headerRow = allRows.find(row => row.querySelector('th'));
    const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.innerText.trim().toUpperCase()) : [];
    
    const findColumn = (variations) => {
      for (const variant of variations) {
        const idx = headers.findIndex(h => h.includes(variant));
        if (idx !== -1) return idx;
      }
      return -1;
    };
    
    const columnMap = {
      jersey: findColumn(['#', 'NO', 'NUM']),
      name: findColumn(['NAME', 'PLAYER']),
      gp: findColumn(['GP', 'GAMES PLAYED', 'GAMES']),
      goals: findColumn(['G', 'GOALS']),
      assists: findColumn(['A', 'ASSISTS']),
      points: findColumn(['PTS', 'POINTS', 'P']),
      pims: findColumn(['PIM', 'PIMS', 'PENALTY']),
      shots: findColumn(['S', 'SOG', 'SHOTS']),
    };
    
    return { headers, columnMap };
  });
  
  console.log('Headers found:', result.headers);
  console.log('\nColumn map:');
  Object.entries(result.columnMap).forEach(([field, idx]) => {
    console.log(`  ${field}: ${idx} (${idx !== -1 ? result.headers[idx] : 'NOT FOUND'})`);
  });
  
  await browser.close();
})();
