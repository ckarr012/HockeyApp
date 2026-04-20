const { getDb, saveDb } = require('../db/database');
const { scrapeRoster, scrapeSchedule, scrapeStats } = require('./achaScraper');
const { saveOpponentRoster, saveOpponentStats } = require('../models/opponentModel');
const crypto = require('crypto');

/**
 * Sync Roosevelt roster to players table
 * Returns { inserted, skipped, players }
 */
const syncRoosterRoster = async (teamId, achaTeamId) => {
  const db = await getDb();
  
  // Scrape roster
  const players = await scrapeRoster(achaTeamId);
  
  // Clean up duplicates first (BUG 3 fix)
  console.log('🧹 Cleaning up duplicate players...');
  const allPlayersResult = db.exec('SELECT id, jersey_number, first_name, last_name, created_at FROM players WHERE team_id = ? ORDER BY created_at ASC', [teamId]);
  if (allPlayersResult.length > 0 && allPlayersResult[0].values.length > 0) {
    const seen = new Map();
    const toDelete = [];
    
    allPlayersResult[0].values.forEach(row => {
      const [id, jersey, firstName, lastName, createdAt] = row;
      const normalizedKey = normalizeName(`${jersey}-${firstName}-${lastName}`);
      
      if (seen.has(normalizedKey)) {
        // Keep the older one (first seen), delete this duplicate
        toDelete.push(id);
      } else {
        seen.set(normalizedKey, id);
      }
    });
    
    if (toDelete.length > 0) {
      console.log(`   Deleting ${toDelete.length} duplicate player(s)`);
      for (const id of toDelete) {
        db.run('DELETE FROM players WHERE id = ?', [id]);
      }
      await saveDb();
    }
  }
  
  // Get existing players to check for duplicates (with normalized names)
  const existingResult = db.exec('SELECT jersey_number, first_name, last_name FROM players WHERE team_id = ?', [teamId]);
  const existing = new Set();
  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    existingResult[0].values.forEach(row => {
      const key = normalizeName(`${row[0]}-${row[1]}-${row[2]}`);
      existing.add(key);
    });
  }
  
  let inserted = 0;
  let skipped = 0;
  
  // Track defense count for alternating LD/RD
  let defenseCount = 0;
  
  // Count positions before mapping
  const positionCounts = { before: {}, after: {} };
  players.forEach(p => {
    positionCounts.before[p.position] = (positionCounts.before[p.position] || 0) + 1;
  });
  
  // Separate forwards from other positions for intelligent distribution
  const forwards = [];
  const nonForwards = [];
  
  players.forEach(p => {
    const pos = (p.position || '').trim().toUpperCase();
    if (pos === 'F' || pos === 'FORWARD') {
      forwards.push(p);
    } else {
      nonForwards.push(p);
    }
  });
  
  // Distribute forwards across C/LW/RW using shoots-hand heuristic
  const leftShooters = forwards.filter(p => p.shoots?.toLowerCase().includes('l'));
  const rightShooters = forwards.filter(p => p.shoots?.toLowerCase().includes('r'));
  const unknownShooters = forwards.filter(p => !p.shoots || (!p.shoots.toLowerCase().includes('l') && !p.shoots.toLowerCase().includes('r')));
  
  const forwardPositions = [];
  
  // Target: roughly 1/3 each for C, LW, RW
  const targetPerPosition = Math.ceil(forwards.length / 3);
  
  // Fill LW from left shooters
  for (let i = 0; i < leftShooters.length && forwardPositions.filter(fp => fp.position === 'left_wing').length < targetPerPosition; i++) {
    forwardPositions.push({ player: leftShooters[i], position: 'left_wing' });
  }
  
  // Fill RW from right shooters
  for (let i = 0; i < rightShooters.length && forwardPositions.filter(fp => fp.position === 'right_wing').length < targetPerPosition; i++) {
    forwardPositions.push({ player: rightShooters[i], position: 'right_wing' });
  }
  
  // Fill C from remaining left shooters
  for (let i = 0; i < leftShooters.length; i++) {
    if (!forwardPositions.find(fp => fp.player === leftShooters[i])) {
      forwardPositions.push({ player: leftShooters[i], position: 'center' });
    }
  }
  
  // Fill C from remaining right shooters
  for (let i = 0; i < rightShooters.length; i++) {
    if (!forwardPositions.find(fp => fp.player === rightShooters[i])) {
      forwardPositions.push({ player: rightShooters[i], position: 'center' });
    }
  }
  
  // Unknown shooters default to center
  unknownShooters.forEach(p => {
    forwardPositions.push({ player: p, position: 'center' });
  });
  
  // Map non-forwards using existing logic
  const mappedPlayers = [];
  
  forwardPositions.forEach(fp => {
    positionCounts.after[fp.position] = (positionCounts.after[fp.position] || 0) + 1;
    mappedPlayers.push({ ...fp.player, mappedPosition: fp.position });
  });
  
  nonForwards.forEach(p => {
    const position = mapPosition(p.position, p.shoots, defenseCount);
    if (position === 'left_defense' || position === 'right_defense') {
      defenseCount++;
    }
    positionCounts.after[position] = (positionCounts.after[position] || 0) + 1;
    mappedPlayers.push({ ...p, mappedPosition: position });
  });
  
  // Reset defense count for actual insertion
  defenseCount = 0;
  
  for (const player of mappedPlayers) {
    const key = normalizeName(`${player.jerseyNumber}-${player.firstName}-${player.lastName}`);
    if (existing.has(key)) {
      skipped++;
      continue;
    }
    
    // Use pre-mapped position
    const position = player.mappedPosition;
    if (position === 'left_defense' || position === 'right_defense') {
      defenseCount++;
    }
    
    // Determine shoots hand
    const shoots = player.shoots?.toLowerCase().includes('l') ? 'left' : 
                   player.shoots?.toLowerCase().includes('r') ? 'right' : 'left';
    
    db.run(
      `INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, height, weight, shoots, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        teamId,
        player.firstName,
        player.lastName,
        player.jerseyNumber,
        position,
        player.height ? parseHeight(player.height) : null,
        player.weight,
        shoots,
        'active'
      ]
    );
    inserted++;
  }
  
  await saveDb();
  
  // Log position distribution
  console.log('📊 Position mapping results:');
  console.log('   Before:', positionCounts.before);
  console.log('   After:', positionCounts.after);
  
  return { inserted, skipped, players };
};

/**
 * Sync Roosevelt schedule to games table
 * Returns { inserted, skipped, games }
 */
const syncRoosterSchedule = async (teamId, achaTeamId) => {
  const db = await getDb();
  
  // Scrape schedule
  const games = await scrapeSchedule(achaTeamId);
  
  // Get existing games to check for duplicates
  const existingResult = db.exec('SELECT opponent, game_date FROM games WHERE team_id = ?', [teamId]);
  const existing = new Set();
  if (existingResult.length > 0 && existingResult[0].values.length > 0) {
    existingResult[0].values.forEach(row => {
      const date = new Date(row[1]).toDateString();
      existing.add(`${row[0].toLowerCase()}-${date}`);
    });
  }
  
  let inserted = 0;
  let skipped = 0;
  
  for (const game of games) {
    const key = `${game.opponent.toLowerCase()}-${new Date(game.gameDate).toDateString()}`;
    if (existing.has(key)) {
      skipped++;
      continue;
    }
    
    db.run(
      `INSERT INTO games (id, team_id, opponent, game_date, location, home_away, status, team_score, opponent_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        crypto.randomUUID(),
        teamId,
        game.opponent,
        game.gameDate,
        game.location || 'TBD',
        game.homeAway,
        game.status,
        game.teamScore,
        game.opponentScore
      ]
    );
    inserted++;
  }
  
  await saveDb();
  return { inserted, skipped, games };
};

/**
 * Sync opponent roster and stats
 * Returns { roster, stats }
 */
const syncOpponent = async (teamId, opponentName, achaTeamId) => {
  // Scrape roster and stats
  const roster = await scrapeRoster(achaTeamId);
  const stats = await scrapeStats(achaTeamId);
  
  // Save to DB
  await saveOpponentRoster(teamId, opponentName, achaTeamId, roster);
  await saveOpponentStats(teamId, opponentName, achaTeamId, stats);
  
  return { roster, stats };
};

// Helper: normalize name for deduplication (lowercase, strip apostrophes, collapse whitespace)
function normalizeName(name) {
  return name.toLowerCase().replace(/['\u2019]/g, '').replace(/\s+/g, ' ').trim();
}

// Helper: map ACHA position to our schema
function mapPosition(pos, shoots, defenseCount) {
  const p = (pos || '').trim().toUpperCase();
  
  // Handle specific positions first
  if (p === 'G' || p === 'GOALIE') return 'goalie';
  if (p === 'C' || p === 'CENTER') return 'center';
  if (p === 'LW' || p === 'LEFT WING') return 'left_wing';
  if (p === 'RW' || p === 'RIGHT WING') return 'right_wing';
  if (p === 'LD' || p === 'LEFT DEFENSE') return 'left_defense';
  if (p === 'RD' || p === 'RIGHT DEFENSE') return 'right_defense';
  
  // Handle generic codes
  if (p === 'F' || p === 'FORWARD') {
    // Map forwards to center by default (acceptable fallback)
    return 'center';
  }
  
  if (p === 'D' || p === 'DEFENSE' || p === 'DEFENSEMAN') {
    // Split defense by shoots hand if available, otherwise alternate
    if (shoots) {
      const s = shoots.toLowerCase();
      if (s.includes('l')) return 'left_defense';
      if (s.includes('r')) return 'right_defense';
    }
    // Alternate if no shoots data
    return defenseCount % 2 === 0 ? 'left_defense' : 'right_defense';
  }
  
  // Default fallback
  return 'center';
}

// Helper: parse height string like "5'11\"" to cm
function parseHeight(h) {
  if (!h) return null;
  const match = h.match(/(\d+)'(\d+)"?/);
  if (match) {
    return Math.round(parseInt(match[1]) * 30.48 + parseInt(match[2]) * 2.54);
  }
  return null;
}

module.exports = {
  syncRoosterRoster,
  syncRoosterSchedule,
  syncOpponent
};
