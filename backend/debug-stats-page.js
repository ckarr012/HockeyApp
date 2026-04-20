const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
  
  const url = 'https://www.achahockey.org/stats/player-stats/395/59?conference=8&division=-1&playertype=skater&position=skaters&rookie=no&sort=points&statstype=standard&page=1&league=1';
  console.log('Loading:', url);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  const pageInfo = await page.evaluate(() => {
    const tables = document.querySelectorAll('table');
    const thead = document.querySelector('table thead');
    const tbody = document.querySelector('table tbody');
    const theadRows = thead ? thead.querySelectorAll('tr') : [];
    const tbodyRows = tbody ? tbody.querySelectorAll('tr') : [];
    
    const headers = thead ? Array.from(thead.querySelectorAll('th')).map(th => th.innerText.trim()) : [];
    
    // Get first 3 data rows
    const sampleRows = Array.from(tbodyRows).slice(0, 3).map(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      return cells.map(td => td.innerText.trim());
    });
    
    return {
      tableCount: tables.length,
      theadRowCount: theadRows.length,
      tbodyRowCount: tbodyRows.length,
      headers: headers,
      sampleRows: sampleRows,
      bodyHTML: tbody ? tbody.innerHTML.substring(0, 500) : 'NO TBODY'
    };
  });
  
  console.log('\nPage Analysis:');
  console.log('Tables found:', pageInfo.tableCount);
  console.log('Thead rows:', pageInfo.theadRowCount);
  console.log('Tbody rows:', pageInfo.tbodyRowCount);
  console.log('Headers:', pageInfo.headers);
  console.log('\nSample data rows:');
  pageInfo.sampleRows.forEach((row, i) => {
    console.log(`  Row ${i}:`, row);
  });
  console.log('\nFirst 500 chars of tbody HTML:');
  console.log(pageInfo.bodyHTML);
  
  await browser.close();
})();
