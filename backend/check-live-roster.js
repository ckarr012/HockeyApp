const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  console.log('Checking Lindenwood Season 60 (2025-26) roster on live ACHA website...\n');
  
  await page.goto('https://achahockey.org/stats/roster/395/60', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const rosterData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 3) return null;
      const text = cells.map(c => c.innerText.trim());
      return {
        jersey: text[0],
        name: text[1],
        position: text[2]
      };
    }).filter(p => p && p.name);
  });
  
  console.log('=== LIVE SEASON 60 ROSTER (from achahockey.org) ===\n');
  rosterData.forEach(p => {
    console.log(`#${p.jersey || '?'} ${p.name} (${p.position || 'N/A'})`);
  });
  
  console.log(`\nTotal players on live site: ${rosterData.length}\n`);
  console.log('='.repeat(60));
  
  // Now check Season 59 stats to see if any of those players are still listed
  console.log('\nChecking Season 59 (2024-25) stats on live ACHA website...\n');
  
  await page.goto('https://achahockey.org/stats/player-stats/395/59?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  
  await new Promise(r => setTimeout(r, 3000));
  
  const statsData = await page.evaluate(() => {
    const allRows = Array.from(document.querySelectorAll('table tbody tr'));
    const dataRows = allRows.filter(row => row.querySelector('td') && row.querySelectorAll('td').length >= 5);
    
    return dataRows.slice(0, 10).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      const text = cells.map(c => c.innerText.trim());
      return {
        rank: text[0],
        jersey: text[1],
        name: text[3],
        gp: text[7],
        g: text[8],
        a: text[9],
        pts: text[10]
      };
    });
  });
  
  console.log('=== LIVE SEASON 59 TOP 10 SCORERS (from achahockey.org) ===\n');
  statsData.forEach(p => {
    console.log(`${p.name} — ${p.pts} pts (${p.g}G, ${p.a}A) in ${p.gp} GP`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('\n=== CROSS-REFERENCE CHECK ===\n');
  
  // Check if any Season 59 top scorers appear in Season 60 roster
  const season59Names = statsData.map(p => p.name.toLowerCase().replace(/['\u2019-]/g, '').replace(/\s+/g, ' ').trim());
  const season60Names = rosterData.map(p => p.name.toLowerCase().replace(/['\u2019-]/g, '').replace(/\s+/g, ' ').trim());
  
  let foundMatches = 0;
  statsData.forEach((s59, idx) => {
    const normalized = season59Names[idx];
    if (season60Names.includes(normalized)) {
      console.log(`✅ FOUND: ${s59.name} (Season 59 scorer) IS on Season 60 roster`);
      foundMatches++;
    } else {
      console.log(`❌ NOT FOUND: ${s59.name} (Season 59 scorer) is NOT on Season 60 roster`);
    }
  });
  
  console.log(`\nMatches: ${foundMatches} / ${statsData.length} Season 59 top scorers still on Season 60 roster\n`);
  
  await browser.close();
})();
