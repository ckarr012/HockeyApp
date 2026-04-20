const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--ignore-certificate-errors']
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(30000);

  console.log('=== STEP 1: Testing Season IDs ===\n');
  
  // Test Roosevelt team stats for different seasons
  for (const seasonId of [60, 61, 62]) {
    console.log(`--- Season ${seasonId} (Roosevelt Team 405) ---`);
    try {
      await page.goto(`https://achahockey.org/stats/team-stats/405/${seasonId}`, { 
        waitUntil: 'networkidle0' 
      });
      await new Promise(r => setTimeout(r, 3000));
      
      const pageInfo = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const tables = document.querySelectorAll('table');
        const rows = document.querySelectorAll('table tr');
        
        return {
          title: document.title,
          h1: h1 ? h1.textContent.trim() : 'N/A',
          h2: h2 ? h2.textContent.trim() : 'N/A',
          tableCount: tables.length,
          rowCount: rows.length,
          hasData: rows.length > 2
        };
      });
      
      console.log('Status: 200 OK');
      console.log('Title:', pageInfo.title);
      console.log('H1:', pageInfo.h1);
      console.log('H2:', pageInfo.h2);
      console.log('Tables found:', pageInfo.tableCount);
      console.log('Table rows found:', pageInfo.rowCount);
      console.log('Has data:', pageInfo.hasData);
    } catch (e) {
      console.log('Error:', e.message);
    }
    console.log('');
  }

  console.log('\n=== STEP 2: Testing Lindenwood Player Stats (Team 395) ===\n');
  
  for (const seasonId of [60, 61, 62]) {
    console.log(`--- Season ${seasonId} ---`);
    try {
      await page.goto(`https://achahockey.org/stats/player-stats/395/${seasonId}`, { 
        waitUntil: 'networkidle0' 
      });
      await new Promise(r => setTimeout(r, 3000));
      
      const statsInfo = await page.evaluate(() => {
        const tables = document.querySelectorAll('table');
        const rows = document.querySelectorAll('table tbody tr');
        const headers = Array.from(document.querySelectorAll('table thead th')).map(th => th.textContent.trim());
        
        // Get first 3 data rows
        const sampleRows = Array.from(rows).slice(0, 3).map(row => {
          const cells = Array.from(row.querySelectorAll('td'));
          return cells.map(td => td.textContent.trim());
        });
        
        return {
          tableCount: tables.length,
          rowCount: rows.length,
          headers: headers,
          sampleRows: sampleRows
        };
      });
      
      console.log('Tables found:', statsInfo.tableCount);
      console.log('Data rows found:', statsInfo.rowCount);
      console.log('Headers:', statsInfo.headers);
      console.log('Sample rows:', JSON.stringify(statsInfo.sampleRows, null, 2));
      
      // Get first 3000 chars of HTML
      const html = await page.content();
      console.log('\nFirst 3000 chars of HTML:');
      console.log(html.substring(0, 3000));
    } catch (e) {
      console.log('Error:', e.message);
    }
    console.log('\n');
  }

  console.log('\n=== STEP 3: Checking Current Scraper Selectors ===\n');
  console.log('Reading backend/services/achaScraper.js...\n');

  await browser.close();
})();
