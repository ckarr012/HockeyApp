const { getDb, saveDb } = require('./database');
const { v4: uuidv4 } = require('uuid');

console.log('Seeding database...');

const teamAId = uuidv4();
const teamBId = uuidv4();

const teams = [
  {
    id: teamAId,
    name: 'College Wildcats',
    division: 'NCAA Division I',
    season: '2025-2026'
  },
  {
    id: teamBId,
    name: 'Junior Rangers',
    division: 'Junior A',
    season: '2025-2026'
  }
];

const users = [
  {
    id: uuidv4(),
    username: 'Dad',
    full_name: 'Coach Dad',
    role: 'coach',
    team_id: teamAId
  },
  {
    id: uuidv4(),
    username: 'Smith',
    full_name: 'Coach Smith',
    role: 'coach',
    team_id: teamBId
  }
];

const playerA1Id = uuidv4();
const playerA2Id = uuidv4();
const playerA3Id = uuidv4();
const playerA4Id = uuidv4();
const playerA5Id = uuidv4();

const playerB1Id = uuidv4();
const playerB2Id = uuidv4();
const playerB3Id = uuidv4();
const playerB4Id = uuidv4();
const playerB5Id = uuidv4();

const playersTeamA = [
  {
    id: playerA1Id,
    team_id: teamAId,
    first_name: 'Connor',
    last_name: 'Williams',
    jersey_number: 87,
    position: 'center',
    birth_date: '2004-03-15',
    height: 185,
    weight: 88,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerA2Id,
    team_id: teamAId,
    first_name: 'Alex',
    last_name: 'Thompson',
    jersey_number: 29,
    position: 'goalie',
    birth_date: '2003-11-22',
    height: 188,
    weight: 92,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerA3Id,
    team_id: teamAId,
    first_name: 'Tyler',
    last_name: 'Anderson',
    jersey_number: 19,
    position: 'left_wing',
    birth_date: '2005-01-10',
    height: 180,
    weight: 82,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerA4Id,
    team_id: teamAId,
    first_name: 'Jake',
    last_name: 'Martinez',
    jersey_number: 44,
    position: 'right_defense',
    birth_date: '2004-07-22',
    height: 183,
    weight: 90,
    shoots: 'right',
    status: 'injured',
    injury_note: 'Lower body injury, out 2-3 weeks'
  },
  {
    id: playerA5Id,
    team_id: teamAId,
    first_name: 'Ryan',
    last_name: "O'Connor",
    jersey_number: 12,
    position: 'right_wing',
    birth_date: '2004-12-05',
    height: 178,
    weight: 85,
    shoots: 'right',
    status: 'active'
  }
];

const playersTeamB = [
  {
    id: playerB1Id,
    team_id: teamBId,
    first_name: 'Ethan',
    last_name: 'Johnson',
    jersey_number: 9,
    position: 'center',
    birth_date: '2005-06-18',
    height: 182,
    weight: 86,
    shoots: 'right',
    status: 'active'
  },
  {
    id: playerB2Id,
    team_id: teamBId,
    first_name: 'Noah',
    last_name: 'Davis',
    jersey_number: 1,
    position: 'goalie',
    birth_date: '2004-09-25',
    height: 190,
    weight: 95,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerB3Id,
    team_id: teamBId,
    first_name: 'Liam',
    last_name: 'Brown',
    jersey_number: 17,
    position: 'left_wing',
    birth_date: '2005-02-14',
    height: 177,
    weight: 80,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerB4Id,
    team_id: teamBId,
    first_name: 'Mason',
    last_name: 'Wilson',
    jersey_number: 5,
    position: 'left_defense',
    birth_date: '2004-11-30',
    height: 185,
    weight: 91,
    shoots: 'left',
    status: 'active'
  },
  {
    id: playerB5Id,
    team_id: teamBId,
    first_name: 'Lucas',
    last_name: 'Taylor',
    jersey_number: 22,
    position: 'right_wing',
    birth_date: '2005-04-08',
    height: 179,
    weight: 83,
    shoots: 'right',
    status: 'active'
  }
];

const gameA1Id = uuidv4();
const gameA2Id = uuidv4();
const gameA3Id = uuidv4();
const gameB1Id = uuidv4();
const gameB2Id = uuidv4();
const gameB3Id = uuidv4();

const gamesTeamA = [
  {
    id: gameA1Id,
    team_id: teamAId,
    opponent: 'State University Bears',
    game_date: '2026-02-10T19:00:00Z',
    location: 'Home Arena',
    home_away: 'home',
    status: 'scheduled',
    team_score: null,
    opponent_score: null
  },
  {
    id: gameA2Id,
    team_id: teamAId,
    opponent: 'Tech College Titans',
    game_date: '2026-02-03T18:00:00Z',
    location: 'Tech Arena',
    home_away: 'away',
    status: 'completed',
    team_score: 4,
    opponent_score: 2
  },
  {
    id: gameA3Id,
    team_id: teamAId,
    opponent: 'Regional College Eagles',
    game_date: '2026-01-28T19:30:00Z',
    location: 'Home Arena',
    home_away: 'home',
    status: 'completed',
    team_score: 3,
    opponent_score: 3
  }
];

const gamesTeamB = [
  {
    id: gameB1Id,
    team_id: teamBId,
    opponent: 'Thunder Hawks',
    game_date: '2026-02-08T18:30:00Z',
    location: 'Rangers Arena',
    home_away: 'home',
    status: 'scheduled',
    team_score: null,
    opponent_score: null
  },
  {
    id: gameB2Id,
    team_id: teamBId,
    opponent: 'Lightning Bolts',
    game_date: '2026-02-01T19:00:00Z',
    location: 'Bolts Arena',
    home_away: 'away',
    status: 'completed',
    team_score: 5,
    opponent_score: 3
  },
  {
    id: gameB3Id,
    team_id: teamBId,
    opponent: 'Storm Eagles',
    game_date: '2026-01-25T18:00:00Z',
    location: 'Rangers Arena',
    home_away: 'home',
    status: 'completed',
    team_score: 2,
    opponent_score: 4
  }
];

const videosTeamA = [
  {
    id: uuidv4(),
    team_id: teamAId,
    title: 'Game vs Tech Titans - Full Game',
    game_id: null
  },
  {
    id: uuidv4(),
    team_id: teamAId,
    title: 'Power Play Practice Drills',
    game_id: null
  }
];

const videosTeamB = [
  {
    id: uuidv4(),
    team_id: teamBId,
    title: 'Game vs Lightning Bolts Highlights',
    game_id: null
  }
];

const practiceAId = uuidv4();
const practiceBId = uuidv4();

const practicesTeamA = [
  {
    id: practiceAId,
    team_id: teamAId,
    practice_date: '2026-02-05T14:00:00Z',
    focus: 'Power Play Development',
    duration: 90,
    location: 'Main Ice Rink'
  }
];

const practicesTeamB = [
  {
    id: practiceBId,
    team_id: teamBId,
    practice_date: '2026-02-06T15:00:00Z',
    focus: 'Defensive Zone Coverage',
    duration: 75,
    location: 'Community Arena'
  }
];

const drillsTeamA = [
  {
    id: uuidv4(),
    practice_id: practiceAId,
    name: '5-on-4 Power Play',
    duration: 15,
    description: 'Work on umbrella formation and puck movement',
    drill_order: 1
  },
  {
    id: uuidv4(),
    practice_id: practiceAId,
    name: 'Power Play Entry Drills',
    duration: 20,
    description: 'Practice controlled entries and dump-and-chase',
    drill_order: 2
  },
  {
    id: uuidv4(),
    practice_id: practiceAId,
    name: 'PP Shooting Accuracy',
    duration: 15,
    description: 'One-timers and tips from the slot',
    drill_order: 3
  }
];

const drillsTeamB = [
  {
    id: uuidv4(),
    practice_id: practiceBId,
    name: 'Defensive Zone Positioning',
    duration: 20,
    description: 'Box-plus-one defensive formation',
    drill_order: 1
  },
  {
    id: uuidv4(),
    practice_id: practiceBId,
    name: 'Breakout Patterns',
    duration: 15,
    description: 'Quick breakouts under pressure',
    drill_order: 2
  }
];

const lineupsTeamA = [
  {
    id: uuidv4(),
    team_id: teamAId,
    name: 'Starting Lineup',
    lw_id: playerA3Id,
    c_id: playerA1Id,
    rw_id: playerA5Id,
    ld_id: playerA4Id,
    rd_id: null,
    g_id: playerA2Id
  }
];

const lineupsTeamB = [
  {
    id: uuidv4(),
    team_id: teamBId,
    name: 'Starting Lineup',
    lw_id: playerB3Id,
    c_id: playerB1Id,
    rw_id: playerB5Id,
    ld_id: playerB4Id,
    rd_id: null,
    g_id: playerB2Id
  }
];

const playerStatsTeamA = [
  { id: uuidv4(), player_id: playerA1Id, game_id: gameA2Id, goals: 2, assists: 1, shots: 5, blocks: 0, pims: 0 },
  { id: uuidv4(), player_id: playerA3Id, game_id: gameA2Id, goals: 1, assists: 2, shots: 4, blocks: 1, pims: 2 },
  { id: uuidv4(), player_id: playerA5Id, game_id: gameA2Id, goals: 1, assists: 0, shots: 3, blocks: 0, pims: 0 },
  { id: uuidv4(), player_id: playerA2Id, game_id: gameA2Id, goals: 0, assists: 0, shots: 0, blocks: 8, pims: 0 },
  { id: uuidv4(), player_id: playerA1Id, game_id: gameA3Id, goals: 1, assists: 1, shots: 6, blocks: 0, pims: 0 },
  { id: uuidv4(), player_id: playerA3Id, game_id: gameA3Id, goals: 1, assists: 0, shots: 3, blocks: 2, pims: 0 },
  { id: uuidv4(), player_id: playerA5Id, game_id: gameA3Id, goals: 1, assists: 1, shots: 4, blocks: 0, pims: 2 },
  { id: uuidv4(), player_id: playerA4Id, game_id: gameA3Id, goals: 0, assists: 1, shots: 2, blocks: 3, pims: 0 }
];

const playerStatsTeamB = [
  { id: uuidv4(), player_id: playerB1Id, game_id: gameB2Id, goals: 3, assists: 1, shots: 7, blocks: 0, pims: 0 },
  { id: uuidv4(), player_id: playerB3Id, game_id: gameB2Id, goals: 1, assists: 2, shots: 5, blocks: 1, pims: 0 },
  { id: uuidv4(), player_id: playerB5Id, game_id: gameB2Id, goals: 1, assists: 1, shots: 4, blocks: 0, pims: 2 },
  { id: uuidv4(), player_id: playerB2Id, game_id: gameB2Id, goals: 0, assists: 0, shots: 0, blocks: 12, pims: 0 },
  { id: uuidv4(), player_id: playerB1Id, game_id: gameB3Id, goals: 1, assists: 0, shots: 4, blocks: 0, pims: 0 },
  { id: uuidv4(), player_id: playerB3Id, game_id: gameB3Id, goals: 0, assists: 1, shots: 2, blocks: 1, pims: 0 },
  { id: uuidv4(), player_id: playerB5Id, game_id: gameB3Id, goals: 1, assists: 0, shots: 3, blocks: 0, pims: 4 },
  { id: uuidv4(), player_id: playerB4Id, game_id: gameB3Id, goals: 0, assists: 0, shots: 1, blocks: 4, pims: 2 }
];

const scoutingReportsTeamA = [
  {
    id: uuidv4(),
    team_id: teamAId,
    game_id: gameA1Id,
    opponent_name: 'State University Bears',
    date: '2026-02-10T19:00:00Z',
    strengths: 'Strong defensive zone coverage, excellent penalty kill unit',
    weaknesses: 'Weak on breakouts, struggles with speed on the wings',
    key_players_json: JSON.stringify([
      { name: 'Mike Johnson', number: 19, position: 'Center', notes: 'Top scorer, dangerous on faceoffs' },
      { name: 'Tom Davis', number: 27, position: 'Defense', notes: 'Physical player, blocks shots' },
      { name: 'Steve Miller', number: 35, position: 'Goalie', notes: 'Weak glove side, plays deep in net' }
    ]),
    tactical_notes: 'Press high in offensive zone, force quick decisions. Target #35 glove side on breakaways.',
    power_play_tendency: 'Umbrella formation with point shot from #27. Look for cross-ice passes.',
    goalie_weakness: 'Glove side high, especially on quick releases. Slow to recover on rebounds.'
  }
];

const scoutingReportsTeamB = [
  {
    id: uuidv4(),
    team_id: teamBId,
    game_id: gameB1Id,
    opponent_name: 'Metro College Lions',
    date: '2026-02-08T18:30:00Z',
    strengths: 'Fast transition game, skilled forwards with good hands',
    weaknesses: 'Defense pinches too much, goalie struggles with traffic in front',
    key_players_json: JSON.stringify([
      { name: 'Kevin White', number: 91, position: 'Right Wing', notes: 'Elite speed, breakaway threat' },
      { name: 'Paul Green', number: 44, position: 'Center', notes: 'Playmaker, excellent vision' },
      { name: 'Dan Brown', number: 1, position: 'Goalie', notes: 'Struggles with screens, overcommits on dekes' }
    ]),
    tactical_notes: 'Get bodies in front of net, create chaos. Exploit defensive pinches with stretch passes.',
    power_play_tendency: 'Overload one side, use quick passing to open up shooting lanes.',
    goalie_weakness: 'Cannot handle traffic in front. Weak on low shots when screened.'
  }
];

// Prospects data
const prospectsTeamA = [
  {
    id: uuidv4(),
    team_id: teamAId,
    name: 'Jake Morrison',
    position: 'Center',
    grad_year: 2026,
    current_team: 'St. Mary\'s High School',
    scout_rating: 5,
    contact_info: 'jake.morrison@email.com | (555) 123-4567',
    status: 'Offered',
    coaching_notes: 'Elite two-way forward. Excellent hockey IQ and vision. Natural leader on the ice. Would be perfect 1st line center.'
  },
  {
    id: uuidv4(),
    team_id: teamAId,
    name: 'Connor Stevens',
    position: 'Defense',
    grad_year: 2026,
    current_team: 'Boston Jr. Bruins',
    scout_rating: 4,
    contact_info: 'cstevens@email.com | (555) 234-5678',
    status: 'Contacted',
    coaching_notes: 'Strong defensive presence. Good size (6\'2"). Needs work on offensive zone play but solid foundation.'
  },
  {
    id: uuidv4(),
    team_id: teamAId,
    name: 'Tyler Bennett',
    position: 'Right Wing',
    grad_year: 2027,
    current_team: 'Riverside Academy',
    scout_rating: 3,
    contact_info: 'tbennett@email.com',
    status: 'Watching',
    coaching_notes: 'Good skater with developing shot. Needs to improve physical play. Worth monitoring through next season.'
  }
];

const prospectsTeamB = [
  {
    id: uuidv4(),
    team_id: teamBId,
    name: 'Marcus Williams',
    position: 'Goalie',
    grad_year: 2026,
    current_team: 'Metro Valley Stars',
    scout_rating: 5,
    contact_info: 'mwilliams@email.com | (555) 345-6789',
    status: 'Committed',
    coaching_notes: 'Top goalie prospect in the region. Excellent reflexes and positioning. Committed for Fall 2026 season.'
  },
  {
    id: uuidv4(),
    team_id: teamBId,
    name: 'Alex Rodriguez',
    position: 'Left Wing',
    grad_year: 2027,
    current_team: 'Lincoln High School',
    scout_rating: 4,
    contact_info: 'arodriguez@email.com',
    status: 'Watching',
    coaching_notes: 'Fast skater with good hands. Needs to improve defensive responsibility. High upside player.'
  }
];

// Prospect videos
const prospectVideosTeamA = [
  {
    id: uuidv4(),
    prospect_id: prospectsTeamA[0].id,
    title: 'Jake Morrison - Season Highlights 2025',
    video_url: 'https://youtube.com/watch?v=example1'
  },
  {
    id: uuidv4(),
    prospect_id: prospectsTeamA[0].id,
    title: 'Jake Morrison - Playoff Performance',
    video_url: 'https://youtube.com/watch?v=example2'
  },
  {
    id: uuidv4(),
    prospect_id: prospectsTeamA[1].id,
    title: 'Connor Stevens - Defensive Reel',
    video_url: 'https://youtube.com/watch?v=example3'
  }
];

const prospectVideosTeamB = [
  {
    id: uuidv4(),
    prospect_id: prospectsTeamB[0].id,
    title: 'Marcus Williams - Save Compilation',
    video_url: 'https://youtube.com/watch?v=example4'
  },
  {
    id: uuidv4(),
    prospect_id: prospectsTeamB[0].id,
    title: 'Marcus Williams - Championship Game',
    video_url: 'https://youtube.com/watch?v=example5'
  }
];

(async () => {
  try {
    const db = await getDb();
    
    db.run('DELETE FROM prospect_videos');
    db.run('DELETE FROM prospects');
    db.run('DELETE FROM scouting_reports');
    db.run('DELETE FROM player_stats');
    db.run('DELETE FROM lineups');
    db.run('DELETE FROM drills');
    db.run('DELETE FROM practices');
    db.run('DELETE FROM videos');
    db.run('DELETE FROM games');
    db.run('DELETE FROM players');
    db.run('DELETE FROM users');
    db.run('DELETE FROM teams');
    console.log('✓ Cleared existing data');

    teams.forEach(team => {
      db.run(`INSERT INTO teams (id, name, division, season) VALUES (?, ?, ?, ?)`,
        [team.id, team.name, team.division, team.season]);
    });
    console.log(`✓ Inserted ${teams.length} teams`);

    users.forEach(user => {
      db.run(`INSERT INTO users (id, username, full_name, role, team_id) VALUES (?, ?, ?, ?, ?)`,
        [user.id, user.username, user.full_name, user.role, user.team_id]);
    });
    console.log(`✓ Inserted ${users.length} users`);

    [...playersTeamA, ...playersTeamB].forEach(player => {
      db.run(`INSERT INTO players (id, team_id, first_name, last_name, jersey_number, position, birth_date, height, weight, shoots, status, injury_note) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [player.id, player.team_id, player.first_name, player.last_name,
         player.jersey_number, player.position, player.birth_date,
         player.height, player.weight, player.shoots, player.status, player.injury_note || null]);
    });
    console.log(`✓ Inserted ${playersTeamA.length + playersTeamB.length} players`);

    [...gamesTeamA, ...gamesTeamB].forEach(game => {
      db.run(`INSERT INTO games (id, team_id, opponent, game_date, location, home_away, status, team_score, opponent_score)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [game.id, game.team_id, game.opponent, game.game_date,
         game.location, game.home_away, game.status,
         game.team_score, game.opponent_score]);
    });
    console.log(`✓ Inserted ${gamesTeamA.length + gamesTeamB.length} games`);

    [...videosTeamA, ...videosTeamB].forEach(video => {
      db.run(`INSERT INTO videos (id, team_id, title, game_id) VALUES (?, ?, ?, ?)`,
        [video.id, video.team_id, video.title, video.game_id]);
    });
    console.log(`✓ Inserted ${videosTeamA.length + videosTeamB.length} videos`);

    [...practicesTeamA, ...practicesTeamB].forEach(practice => {
      db.run(`INSERT INTO practices (id, team_id, practice_date, focus, duration, location) VALUES (?, ?, ?, ?, ?, ?)`,
        [practice.id, practice.team_id, practice.practice_date, practice.focus, practice.duration, practice.location]);
    });
    console.log(`✓ Inserted ${practicesTeamA.length + practicesTeamB.length} practices`);

    [...drillsTeamA, ...drillsTeamB].forEach(drill => {
      db.run(`INSERT INTO drills (id, practice_id, name, duration, description, drill_order) VALUES (?, ?, ?, ?, ?, ?)`,
        [drill.id, drill.practice_id, drill.name, drill.duration, drill.description, drill.drill_order]);
    });
    console.log(`✓ Inserted ${drillsTeamA.length + drillsTeamB.length} drills`);

    [...lineupsTeamA, ...lineupsTeamB].forEach(lineup => {
      db.run(`INSERT INTO lineups (id, team_id, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [lineup.id, lineup.team_id, lineup.name, lineup.lw_id, lineup.c_id, lineup.rw_id, lineup.ld_id, lineup.rd_id, lineup.g_id]);
    });
    console.log(`✓ Inserted ${lineupsTeamA.length + lineupsTeamB.length} lineups`);

    [...playerStatsTeamA, ...playerStatsTeamB].forEach(stat => {
      db.run(`INSERT INTO player_stats (id, player_id, game_id, goals, assists, shots, blocks, pims) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [stat.id, stat.player_id, stat.game_id, stat.goals, stat.assists, stat.shots, stat.blocks, stat.pims]);
    });
    console.log(`✓ Inserted ${playerStatsTeamA.length + playerStatsTeamB.length} player stats`);

    [...scoutingReportsTeamA, ...scoutingReportsTeamB].forEach(report => {
      db.run(`INSERT INTO scouting_reports (id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [report.id, report.team_id, report.game_id, report.opponent_name, report.date, report.strengths, report.weaknesses, report.key_players_json, report.tactical_notes, report.power_play_tendency, report.goalie_weakness]);
    });
    console.log(`✓ Inserted ${scoutingReportsTeamA.length + scoutingReportsTeamB.length} scouting reports`);

    [...prospectsTeamA, ...prospectsTeamB].forEach(prospect => {
      db.run(`INSERT INTO prospects (id, team_id, name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prospect.id, prospect.team_id, prospect.name, prospect.position, prospect.grad_year, prospect.current_team, prospect.scout_rating, prospect.contact_info, prospect.status, prospect.coaching_notes]);
    });
    console.log(`✓ Inserted ${prospectsTeamA.length + prospectsTeamB.length} prospects`);

    [...prospectVideosTeamA, ...prospectVideosTeamB].forEach(video => {
      db.run(`INSERT INTO prospect_videos (id, prospect_id, title, video_url) VALUES (?, ?, ?, ?)`,
        [video.id, video.prospect_id, video.title, video.video_url]);
    });
    console.log(`✓ Inserted ${prospectVideosTeamA.length + prospectVideosTeamB.length} prospect videos`);

    await saveDb();
    
    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Teams: ${teams.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`     • Coach Dad → College Wildcats (${playersTeamA.length} players, ${gamesTeamA.length} games)`);
    console.log(`     • Coach Smith → Junior Rangers (${playersTeamB.length} players, ${gamesTeamB.length} games)`);
    console.log('\n🔑 Login credentials:');
    console.log('   - Username: "Dad" (College Wildcats)');
    console.log('   - Username: "Smith" (Junior Rangers)');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
})();
