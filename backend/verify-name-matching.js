const {getDb} = require('./db/database');

// Same normalization function as in matchup controller
const normalizeName = (name) => {
  return name.toLowerCase()
    .replace(/['\u2019-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

(async () => {
  const db = await getDb();
  
  console.log('=== SEASON 60 ROSTER (Current 2025-26) ===\n');
  const rosterResult = db.exec(`
    SELECT jersey_number, first_name, last_name, position 
    FROM opponent_rosters 
    WHERE team_id='33ce1096-a31f-4d20-9f35-a56b90b087df' AND opponent_name='Lindenwood'
    ORDER BY jersey_number
  `);
  
  const rosterPlayers = [];
  if (rosterResult.length && rosterResult[0].values.length) {
    rosterResult[0].values.forEach(row => {
      const [jersey, first, last, pos] = row;
      const fullName = `${first} ${last}`.trim();
      const normalized = normalizeName(fullName);
      rosterPlayers.push({ jersey, first, last, pos, fullName, normalized });
      console.log(`#${jersey || '?'} ${fullName} (${pos || 'N/A'})`);
      console.log(`  Normalized: "${normalized}"\n`);
    });
  }
  
  console.log(`\nTotal roster players: ${rosterPlayers.length}\n`);
  console.log('='.repeat(60));
  
  console.log('\n=== SEASON 59 STATS (2024-25 Historical) ===\n');
  const statsResult = db.exec(`
    SELECT player_name, games_played, goals, assists, points 
    FROM opponent_player_stats 
    WHERE team_id='33ce1096-a31f-4d20-9f35-a56b90b087df' AND opponent_name='Lindenwood'
    ORDER BY points DESC
  `);
  
  const statsPlayers = [];
  if (statsResult.length && statsResult[0].values.length) {
    statsResult[0].values.forEach(row => {
      const [name, gp, g, a, pts] = row;
      const normalized = normalizeName(name);
      statsPlayers.push({ name, gp, g, a, pts, normalized });
      console.log(`${name} — ${pts} pts (${g}G, ${a}A) in ${gp} GP`);
      console.log(`  Normalized: "${normalized}"\n`);
    });
  }
  
  console.log(`\nTotal stats players: ${statsPlayers.length}\n`);
  console.log('='.repeat(60));
  
  console.log('\n=== MATCHING ANALYSIS ===\n');
  
  // Build lookup from stats
  const statsLookup = new Map();
  statsPlayers.forEach(p => {
    statsLookup.set(p.normalized, p);
  });
  
  // Check for matches
  let matchCount = 0;
  const matches = [];
  const noMatches = [];
  
  rosterPlayers.forEach(rp => {
    if (statsLookup.has(rp.normalized)) {
      matchCount++;
      const sp = statsLookup.get(rp.normalized);
      matches.push({ roster: rp, stats: sp });
      console.log(`✅ MATCH: "${rp.fullName}" (roster) ↔ "${sp.name}" (stats)`);
      console.log(`   Both normalize to: "${rp.normalized}"`);
      console.log(`   Stats: ${sp.pts} pts (${sp.g}G, ${sp.a}A)\n`);
    } else {
      noMatches.push(rp);
    }
  });
  
  console.log(`\nMatches found: ${matchCount} / ${rosterPlayers.length}\n`);
  
  if (noMatches.length > 0) {
    console.log('='.repeat(60));
    console.log('\n=== ROSTER PLAYERS WITH NO STATS MATCH ===\n');
    noMatches.forEach(rp => {
      console.log(`#${rp.jersey || '?'} ${rp.fullName} (${rp.pos || 'N/A'})`);
      console.log(`  Normalized: "${rp.normalized}"`);
      
      // Check for close matches
      const closeMatches = statsPlayers.filter(sp => {
        const dist = levenshteinDistance(rp.normalized, sp.normalized);
        return dist <= 3 && dist > 0;
      });
      
      if (closeMatches.length > 0) {
        console.log(`  ⚠️  Close matches (edit distance ≤3):`);
        closeMatches.forEach(cm => {
          console.log(`     - "${cm.name}" (normalized: "${cm.normalized}")`);
        });
      }
      console.log('');
    });
  }
  
  // Stats players not on roster (departed)
  const departedPlayers = statsPlayers.filter(sp => {
    return !rosterPlayers.some(rp => rp.normalized === sp.normalized);
  });
  
  if (departedPlayers.length > 0) {
    console.log('='.repeat(60));
    console.log('\n=== STATS PLAYERS NOT ON CURRENT ROSTER (Departed) ===\n');
    departedPlayers.forEach(sp => {
      console.log(`${sp.name} — ${sp.pts} pts (${sp.g}G, ${sp.a}A)`);
      console.log(`  Normalized: "${sp.normalized}"\n`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('\n=== NORMALIZATION EDGE CASE TESTS ===\n');
  
  const testCases = [
    "O'Connell",
    "López",
    "Smith-Jones",
    'Michael "Mike" Smith',
    "Arora-Jain",
    "Om Arora-Jain"
  ];
  
  testCases.forEach(test => {
    console.log(`Input: "${test}"`);
    console.log(`Output: "${normalizeName(test)}"\n`);
  });
})();

// Simple Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}
