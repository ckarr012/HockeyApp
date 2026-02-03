const { getDb, saveDb } = require('./database');

console.log('Running database migrations...');

const migrations = [
  `CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    division TEXT NOT NULL,
    season TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'coach',
    team_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,

  `CREATE TABLE IF NOT EXISTS players (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    jersey_number INTEGER NOT NULL,
    position TEXT NOT NULL,
    birth_date TEXT,
    height INTEGER,
    weight INTEGER,
    shoots TEXT,
    status TEXT DEFAULT 'active',
    injury_note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,

  `CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    opponent TEXT NOT NULL,
    game_date DATETIME NOT NULL,
    location TEXT NOT NULL,
    home_away TEXT NOT NULL,
    status TEXT DEFAULT 'scheduled',
    team_score INTEGER,
    opponent_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,

  `CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    game_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
  )`,

  `CREATE TABLE IF NOT EXISTS practices (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    practice_date DATETIME NOT NULL,
    focus TEXT NOT NULL,
    duration INTEGER,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,

  `CREATE TABLE IF NOT EXISTS drills (
    id TEXT PRIMARY KEY,
    practice_id TEXT NOT NULL,
    name TEXT NOT NULL,
    duration INTEGER,
    description TEXT,
    drill_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (practice_id) REFERENCES practices(id)
  )`,

  `CREATE TABLE IF NOT EXISTS lineups (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    name TEXT NOT NULL,
    lw_id TEXT,
    c_id TEXT,
    rw_id TEXT,
    ld_id TEXT,
    rd_id TEXT,
    g_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (lw_id) REFERENCES players(id),
    FOREIGN KEY (c_id) REFERENCES players(id),
    FOREIGN KEY (rw_id) REFERENCES players(id),
    FOREIGN KEY (ld_id) REFERENCES players(id),
    FOREIGN KEY (rd_id) REFERENCES players(id),
    FOREIGN KEY (g_id) REFERENCES players(id)
  )`,

  `CREATE TABLE IF NOT EXISTS player_stats (
    id TEXT PRIMARY KEY,
    player_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    shots INTEGER DEFAULT 0,
    blocks INTEGER DEFAULT 0,
    pims INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
  )`,

  `CREATE TABLE IF NOT EXISTS scouting_reports (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    date DATETIME NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    key_players_json TEXT,
    tactical_notes TEXT,
    power_play_tendency TEXT,
    goalie_weakness TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS prospects (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    grad_year INTEGER NOT NULL,
    current_team TEXT,
    scout_rating INTEGER CHECK(scout_rating >= 1 AND scout_rating <= 5),
    contact_info TEXT,
    status TEXT DEFAULT 'Watching' CHECK(status IN ('Watching', 'Contacted', 'Offered', 'Committed')),
    coaching_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id)
  )`,
  
  `CREATE TABLE IF NOT EXISTS prospect_videos (
    id TEXT PRIMARY KEY,
    prospect_id TEXT NOT NULL,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
  )`
];

(async () => {
  try {
    const db = await getDb();
    
    migrations.forEach((migration, index) => {
      db.run(migration);
      console.log(`✓ Migration ${index + 1} completed`);
    });
    
    await saveDb();
    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
