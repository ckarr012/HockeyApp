# Hockey App — Lineup Code Dump
Copy everything below and paste into Claude.

---

## FILE: src/components/Lineups.tsx

```tsx
import { useState, useEffect } from 'react'
import { Users, Save } from 'lucide-react'
import { fetchLineups, fetchPlayers, updateLineup, Player, Lineup } from '../api/api'

interface LineupsProps {
  teamId: string
}

export default function Lineups({ teamId }: LineupsProps) {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingLineup, setEditingLineup] = useState<Lineup | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [teamId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lineupsData, playersData] = await Promise.all([
        fetchLineups(teamId),
        fetchPlayers(teamId)
      ])
      setLineups(lineupsData)
      setPlayers(playersData)
      if (lineupsData.length > 0) {
        setEditingLineup(lineupsData[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading lineups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editingLineup) return

    try {
      setSaving(true)
      await updateLineup(editingLineup.id, {
        name: editingLineup.name,
        lw_id: editingLineup.lw_id,
        c_id: editingLineup.c_id,
        rw_id: editingLineup.rw_id,
        ld_id: editingLineup.ld_id,
        rd_id: editingLineup.rd_id,
        g_id: editingLineup.g_id
      })
      await loadData()
      alert('Lineup saved successfully!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save lineup')
      console.error('Error saving lineup:', err)
    } finally {
      setSaving(false)
    }
  }

  const updatePosition = (position: string, playerId: string) => {
    if (!editingLineup) return
    setEditingLineup({
      ...editingLineup,
      [`${position}_id`]: playerId || null
    })
  }

  const getPlayersByPosition = (pos: string) => {
    return players.filter(p => p.position.toLowerCase().includes(pos.toLowerCase()))
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lineups...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!editingLineup) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No lineup configured yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 relative min-h-screen">
      {/* Ice Rink Background */}
      <div className="absolute inset-0 ice-rink-texture opacity-40 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow flex items-center gap-3">
              🏒 Lineup Builder
            </h2>
            <p className="text-ice-200 mt-1">Create and manage line combinations</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Lineup'}</span>
          </button>
        </div>

        <div className="glass-strong rounded-xl shadow-2xl border border-white/20 p-6 backdrop-blur-xl">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-ice-400">⚡</span> {editingLineup.name}
          </h3>
        
        <div className="space-y-6">
          {/* Forwards */}
          <div className="border-b border-white/10 pb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-ice-400" />
              ⚡ Forwards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-ice-200 mb-2">Left Wing</label>
                <select
                  value={editingLineup.lw_id || ''}
                  onChange={(e) => updatePosition('lw', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                  {getPlayersByPosition('wing').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ice-200 mb-2">Center</label>
                <select
                  value={editingLineup.c_id || ''}
                  onChange={(e) => updatePosition('c', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                  {getPlayersByPosition('center').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ice-200 mb-2">Right Wing</label>
                <select
                  value={editingLineup.rw_id || ''}
                  onChange={(e) => updatePosition('rw', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                  {getPlayersByPosition('wing').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Defense */}
          <div className="border-b border-white/10 pb-6">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-ice-400">🛡️</span> Defense
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ice-200 mb-2">Left Defense</label>
                <select
                  value={editingLineup.ld_id || ''}
                  onChange={(e) => updatePosition('ld', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                  {getPlayersByPosition('defense').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ice-200 mb-2">Right Defense</label>
                <select
                  value={editingLineup.rd_id || ''}
                  onChange={(e) => updatePosition('rd', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                  {getPlayersByPosition('defense').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Goalie */}
          <div>
            <h4 className="text-xl font-bold text-white mb-4 flex items-center">
              <span className="text-ice-400">🥅</span> Goalie
            </h4>
            <div className="w-full md:w-1/2">
              <select
                value={editingLineup.g_id || ''}
                onChange={(e) => updatePosition('g', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                style={{ colorScheme: 'dark' }}
              >
                <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>Select Player</option>
                {getPlayersByPosition('goalie').map(p => (
                  <option 
                    key={p.id} 
                    value={p.id}
                    disabled={p.status === 'injured'}
                    style={{ backgroundColor: '#1e3a5f', color: 'white' }}
                  >
                    #{p.jerseyNumber} {p.firstName} {p.lastName}
                    {p.status === 'injured' && ' 🚑 INJURED'}
                    {p.status === 'day-to-day' && ' ⚠️ DTD'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
```

---

## FILE: src/api/api.ts (lineup-related types and functions only)

```ts
export interface Lineup {
  id: string;
  team_id: string;
  name: string;
  lw_id?: string;
  c_id?: string;
  rw_id?: string;
  ld_id?: string;
  rd_id?: string;
  g_id?: string;
  lw_first_name?: string;
  lw_last_name?: string;
  lw_number?: number;
  c_first_name?: string;
  c_last_name?: string;
  c_number?: number;
  rw_first_name?: string;
  rw_last_name?: string;
  rw_number?: number;
  ld_first_name?: string;
  ld_last_name?: string;
  ld_number?: number;
  rd_first_name?: string;
  rd_last_name?: string;
  rd_number?: number;
  g_first_name?: string;
  g_last_name?: string;
  g_number?: number;
}

export interface PlayerStats {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  total_goals: number;
  total_assists: number;
  total_points: number;
  total_shots: number;
  total_blocks: number;
  total_pims: number;
  games_played: number;
}

export async function fetchLineups(teamId: string): Promise<Lineup[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lineups: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineups;
}

export async function createLineup(teamId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineupData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create lineup: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineup;
}

export async function updateLineup(lineupId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/lineups/${lineupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lineupData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update lineup: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineup;
}
```

---

## FILE: backend/routes/lineupRoutes.js

```js
const express = require('express');
const router = express.Router();
const { getLineups, addLineup, editLineup } = require('../controllers/lineupController');

router.get('/:teamId/lineups', getLineups);
router.post('/:teamId/lineups', addLineup);
router.put('/lineups/:lineupId', editLineup);

module.exports = router;
```

---

## FILE: backend/controllers/lineupController.js

```js
const { getLineupsByTeamId, createLineup, updateLineup } = require('../models/lineupModel');
const { v4: uuidv4 } = require('uuid');

const getLineups = async (req, res) => {
  try {
    const { teamId } = req.params;
    const lineups = await getLineupsByTeamId(teamId);
    res.json({ lineups });
  } catch (error) {
    console.error('Error in getLineups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addLineup = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Lineup name is required' });
    }

    const lineupData = {
      id: uuidv4(),
      teamId,
      name,
      lw_id,
      c_id,
      rw_id,
      ld_id,
      rd_id,
      g_id
    };

    const lineup = await createLineup(lineupData);
    res.status(201).json({ lineup });
  } catch (error) {
    console.error('Error in addLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const editLineup = async (req, res) => {
  try {
    const { lineupId } = req.params;
    const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = req.body;

    const lineupData = {
      name,
      lw_id,
      c_id,
      rw_id,
      ld_id,
      rd_id,
      g_id
    };

    const lineup = await updateLineup(lineupId, lineupData);
    res.json({ lineup });
  } catch (error) {
    console.error('Error in editLineup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getLineups,
  addLineup,
  editLineup
};
```

---

## FILE: backend/models/lineupModel.js

```js
const { getDb, saveDb } = require('../db/database');

const getLineupsByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      l.*,
      lw.first_name as lw_first_name, lw.last_name as lw_last_name, lw.jersey_number as lw_number,
      c.first_name as c_first_name, c.last_name as c_last_name, c.jersey_number as c_number,
      rw.first_name as rw_first_name, rw.last_name as rw_last_name, rw.jersey_number as rw_number,
      ld.first_name as ld_first_name, ld.last_name as ld_last_name, ld.jersey_number as ld_number,
      rd.first_name as rd_first_name, rd.last_name as rd_last_name, rd.jersey_number as rd_number,
      g.first_name as g_first_name, g.last_name as g_last_name, g.jersey_number as g_number
    FROM lineups l
    LEFT JOIN players lw ON l.lw_id = lw.id
    LEFT JOIN players c ON l.c_id = c.id
    LEFT JOIN players rw ON l.rw_id = rw.id
    LEFT JOIN players ld ON l.ld_id = ld.id
    LEFT JOIN players rd ON l.rd_id = rd.id
    LEFT JOIN players g ON l.g_id = g.id
    WHERE l.team_id = ?
  `, [teamId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const lineup = {};
    columns.forEach((col, i) => lineup[col] = row[i]);
    return lineup;
  });
};

const createLineup = async (lineupData) => {
  const db = await getDb();
  const { id, teamId, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = lineupData;
  
  db.run(
    `INSERT INTO lineups (id, team_id, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, teamId, name, lw_id || null, c_id || null, rw_id || null, ld_id || null, rd_id || null, g_id || null]
  );
  
  await saveDb();
  return { id, teamId, name, lw_id, c_id, rw_id, ld_id, rd_id, g_id };
};

const updateLineup = async (lineupId, lineupData) => {
  const db = await getDb();
  const { name, lw_id, c_id, rw_id, ld_id, rd_id, g_id } = lineupData;
  
  db.run(
    `UPDATE lineups 
     SET name = ?, lw_id = ?, c_id = ?, rw_id = ?, ld_id = ?, rd_id = ?, g_id = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, lw_id || null, c_id || null, rw_id || null, ld_id || null, rd_id || null, g_id || null, lineupId]
  );
  
  await saveDb();
  return { id: lineupId, ...lineupData };
};

module.exports = {
  getLineupsByTeamId,
  createLineup,
  updateLineup
};
```

---

## FILE: backend/db/migrate.js (lineups table only)

```sql
CREATE TABLE IF NOT EXISTS lineups (
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
)
```

---

## FILE: backend/db/seed.js (lineup seed data only)

```js
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
```

---

## FILE: src/api/api.ts (FULL FILE for reference)

```ts
const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: string;
  teamId: string;
  teamName: string;
  division: string;
  season: string;
}

export interface Player {
  id: string;
  teamId: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: string;
  birthDate: string;
  height: number;
  weight: number;
  shoots: string;
  status: string;
  injuryNote?: string;
}

export interface Game {
  id: string;
  teamId: string;
  opponent: string;
  gameDate: string;
  location: string;
  homeAway: string;
  status: string;
  teamScore: number | null;
  opponentScore: number | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'game' | 'practice' | 'film';
  location?: string;
  homeAway?: string;
  status?: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  opponent?: string;
  focus?: string;
  duration?: number;
  url?: string;
  gameId?: string;
}

export interface KeyPlayer {
  name: string;
  number: number;
  position: string;
  notes: string;
}

export interface ScoutingReport {
  id: string;
  teamId: string;
  gameId: string;
  opponentName: string;
  date: string;
  strengths?: string;
  weaknesses?: string;
  keyPlayersJson?: string;
  tacticalNotes?: string;
  powerPlayTendency?: string;
  goalieWeakness?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prospect {
  id: string;
  teamId: string;
  name: string;
  position: string;
  gradYear: number;
  currentTeam?: string;
  scoutRating?: number;
  contactInfo?: string;
  status: 'Watching' | 'Contacted' | 'Offered' | 'Committed';
  coachingNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProspectVideo {
  id: string;
  prospectId: string;
  title: string;
  videoUrl: string;
  createdAt?: string;
}

export interface DashboardNote {
  id: string;
  team_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  team: {
    id: string;
    name: string;
    division: string;
    season: string;
  };
  stats: {
    totalPlayers: number;
    activePlayers: number;
    injuredPlayers: number;
    totalGames: number;
    wins: number;
    losses: number;
    ties: number;
    upcomingGames: number;
    totalVideos: number;
    totalPractices: number;
  };
  nextGame: Game | null;
  nextPractice: {
    id: string;
    teamId: string;
    practiceDate: string;
    focus: string;
  } | null;
}

export async function fetchPlayers(teamId: string): Promise<Player[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/players`);
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }
  const data = await response.json();
  return data.players;
}

export async function fetchGames(teamId: string): Promise<Game[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`);
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  const data = await response.json();
  return data.games;
}

export async function createGame(teamId: string, gameData: {
  game_date: string;
  opponent: string;
  location: string;
  home_away: string;
  status?: string;
}): Promise<{ gameId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  return response.json();
}

export async function updateGameScore(gameId: string, teamScore: number, opponentScore: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}/score`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamScore, opponentScore }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update game score: ${response.statusText}`);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete game: ${response.statusText}`);
  }
}

export async function deleteVideo(videoId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/videos/${videoId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete video: ${response.statusText}`);
  }
}

export async function fetchCalendar(teamId: string): Promise<CalendarEvent[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/calendar`);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.statusText}`);
  }
  const data = await response.json();
  return data.events;
}

export async function fetchDashboard(teamId: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/dashboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
  }
  return response.json();
}

export async function login(username: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  const data = await response.json();
  return data.user;
}

export interface Video {
  id: string;
  team_id: string;
  title: string;
  url?: string;
  game_id?: string;
  created_at: string;
}

export interface Drill {
  id: string;
  practice_id: string;
  name: string;
  duration?: number;
  description?: string;
  drill_order: number;
}

export interface Practice {
  id: string;
  team_id: string;
  practice_date: string;
  focus: string;
  duration?: number;
  location?: string;
  drills: Drill[];
}

export async function fetchVideos(teamId: string): Promise<Video[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/videos`);
  if (!response.ok) {
    throw new Error(`Failed to fetch videos: ${response.statusText}`);
  }
  const data = await response.json();
  return data.videos;
}

export async function createVideo(teamId: string, title: string, url?: string): Promise<Video> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, url }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create video: ${response.statusText}`);
  }
  const data = await response.json();
  return data.video;
}

export async function fetchPractices(teamId: string): Promise<Practice[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/practices`);
  if (!response.ok) {
    throw new Error(`Failed to fetch practices: ${response.statusText}`);
  }
  const data = await response.json();
  return data.practices;
}

export async function createPractice(teamId: string, practiceData: {
  practice_date: string;
  focus: string;
  duration: number;
  location: string;
  drills: Array<{ name: string; duration: number; description: string; }>;
}): Promise<{ practiceId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/practices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(practiceData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create practice: ${response.statusText}`);
  }
  return response.json();
}

export async function deletePractice(practiceId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/practices/${practiceId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete practice: ${response.statusText}`);
  }
}

export interface Lineup {
  id: string;
  team_id: string;
  name: string;
  lw_id?: string;
  c_id?: string;
  rw_id?: string;
  ld_id?: string;
  rd_id?: string;
  g_id?: string;
  lw_first_name?: string;
  lw_last_name?: string;
  lw_number?: number;
  c_first_name?: string;
  c_last_name?: string;
  c_number?: number;
  rw_first_name?: string;
  rw_last_name?: string;
  rw_number?: number;
  ld_first_name?: string;
  ld_last_name?: string;
  ld_number?: number;
  rd_first_name?: string;
  rd_last_name?: string;
  rd_number?: number;
  g_first_name?: string;
  g_last_name?: string;
  g_number?: number;
}

export interface PlayerStats {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number: number;
  position: string;
  total_goals: number;
  total_assists: number;
  total_points: number;
  total_shots: number;
  total_blocks: number;
  total_pims: number;
  games_played: number;
}

export async function fetchLineups(teamId: string): Promise<Lineup[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`);
  if (!response.ok) {
    throw new Error(`Failed to fetch lineups: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineups;
}

export async function createLineup(teamId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/lineups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lineupData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create lineup: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineup;
}

export async function updateLineup(lineupId: string, lineupData: any): Promise<Lineup> {
  const response = await fetch(`${API_BASE_URL}/teams/lineups/${lineupId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lineupData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update lineup: ${response.statusText}`);
  }
  const data = await response.json();
  return data.lineup;
}

export async function fetchTeamStats(teamId: string): Promise<PlayerStats[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }
  const data = await response.json();
  return data.stats;
}

export async function recordGameStats(gameId: string, stats: any[]): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}/stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stats }),
  });
  if (!response.ok) {
    throw new Error(`Failed to record stats: ${response.statusText}`);
  }
}

export async function updatePlayerStatus(playerId: string, status: string, injuryNote?: string): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, injury_note: injuryNote }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update player status: ${response.statusText}`);
  }
  const data = await response.json();
  return data.player;
}

export interface CreatePlayerInput {
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: string;
  shoots: string;
  height?: number;
  weight?: number;
  birthDate?: string;
  status: string;
  injuryNote?: string;
}

export async function createPlayer(teamId: string, player: CreatePlayerInput): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  if (!response.ok) {
    throw new Error(`Failed to create player: ${response.statusText}`);
  }
  const data = await response.json();
  return data.player;
}

export async function updatePlayer(playerId: string, player: Partial<CreatePlayerInput>): Promise<Player> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  if (!response.ok) throw new Error(`Failed to update player: ${response.statusText}`);
  const data = await response.json();
  return data.player;
}

export async function deletePlayer(playerId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/players/${playerId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`Failed to delete player: ${response.statusText}`);
}

export async function importPlayersFromImage(imageBase64: string, mediaType: string): Promise<CreatePlayerInput[]> {
  const response = await fetch(`${API_BASE_URL}/players/import-from-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error ?? 'Failed to import from image');
  }
  const data = await response.json();
  return data.players;
}

export async function fetchScoutingReports(teamId: string): Promise<ScoutingReport[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/scouting`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scouting reports: ${response.statusText}`);
  }
  const data = await response.json();
  return data.reports;
}

export async function fetchScoutingReportByGame(gameId: string, teamId: string): Promise<ScoutingReport | null> {
  const response = await fetch(`${API_BASE_URL}/teams/scouting/games/${gameId}?teamId=${teamId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch scouting report: ${response.statusText}`);
  }
  const data = await response.json();
  return data.report;
}

export async function createScoutingReport(teamId: string, reportData: any): Promise<ScoutingReport> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/scouting`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create scouting report: ${response.statusText}`);
  }
  const data = await response.json();
  return data.report;
}

export async function updateScoutingReport(reportId: string, reportData: any): Promise<ScoutingReport> {
  const response = await fetch(`${API_BASE_URL}/teams/scouting/${reportId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update scouting report: ${response.statusText}`);
  }
  const data = await response.json();
  return data.report;
}

export async function fetchProspects(teamId: string): Promise<Prospect[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/prospects`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prospects: ${response.statusText}`);
  }
  const data = await response.json();
  return data.prospects;
}

export async function fetchProspectDetails(prospectId: string, teamId: string): Promise<{ prospect: Prospect; videos: ProspectVideo[] }> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}?teamId=${teamId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch prospect details: ${response.statusText}`);
  }
  return await response.json();
}

export async function createProspect(teamId: string, prospectData: any): Promise<Prospect> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/prospects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prospectData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create prospect: ${response.statusText}`);
  }
  const data = await response.json();
  return data.prospect;
}

export async function updateProspect(prospectId: string, prospectData: any): Promise<Prospect> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prospectData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update prospect: ${response.statusText}`);
  }
  const data = await response.json();
  return data.prospect;
}

export async function deleteProspect(prospectId: string, teamId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}?teamId=${teamId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete prospect: ${response.statusText}`);
  }
}

export async function fetchDashboardNotes(teamId: string): Promise<DashboardNote[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard notes: ${response.statusText}`);
  }
  const data = await response.json();
  return data.notes;
}

export async function createDashboardNote(teamId: string, noteData: { title: string; content: string; category?: string }): Promise<{ noteId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create dashboard note: ${response.statusText}`);
  }
  return response.json();
}

export async function updateDashboardNote(noteId: string, noteData: { title: string; content: string; category?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update dashboard note: ${response.statusText}`);
  }
}

export async function deleteDashboardNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(`Failed to delete dashboard note: ${response.statusText}`);
  }
}

export async function updateTeamSettings(teamId: string, settings: { name?: string; season?: string; division?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`Failed to update team settings: ${response.statusText}`);
  }
}

export async function addProspectVideo(prospectId: string, teamId: string, videoData: { title: string; videoUrl: string }): Promise<ProspectVideo> {
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ teamId, ...videoData }),
  });
  if (!response.ok) {
    throw new Error(`Failed to add prospect video: ${response.statusText}`);
  }
  const data = await response.json();
  return data.video;
}
```
