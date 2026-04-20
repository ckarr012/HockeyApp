const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.goto(
    'https://www.achahockey.org/stats/player-stats/395/59?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1',
    { waitUntil: 'networkidle2', timeout: 30000 }
  );
  
  await new Promise(r => setTimeout(r, 3000));
  
  const info = await page.evaluate(() => {
    const allRows = Array.from(document.querySelectorAll('table tbody tr'));
    const headerRow = allRows.find(row => row.querySelector('th'));
    const headers = headerRow ? Array.from(headerRow.querySelectorAll('th')).map(th => th.innerText.trim()) : [];
    
    const dataRow = allRows.find(row => row.querySelector('td') && row.querySelectorAll('td').length >= 5);
    const cells = dataRow ? Array.from(dataRow.querySelectorAll('td')).map(td => td.innerText.trim()) : [];
    
    return { headers, sampleData: cells };
  });
  
  console.log('Headers:', info.headers);
  console.log('\nSample data row:', info.sampleData);
  console.log('\nColumn mapping:');
  info.headers.forEach((h, i) => {
    console.log(`  [${i}] ${h} = "${info.sampleData[i]}"`);
  });
  
  await browser.close();
})();
