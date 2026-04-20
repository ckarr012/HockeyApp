const { scrapeStats } = require('./services/achaScraper');

(async () => {
  console.log('Testing scrapeStats for Lindenwood (395)...\n');
  try {
    const stats = await scrapeStats('395');
    console.log('\n✅ Scraper returned:', stats.length, 'players');
    if (stats.length > 0) {
      console.log('\nTop 5 by points:');
      stats.sort((a, b) => b.points - a.points).slice(0, 5).forEach((p, i) => {
        console.log(`  ${i + 1}. ${p.name}: ${p.goals}G + ${p.assists}A = ${p.points}PTS (GP: ${p.gamesPlayed})`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
