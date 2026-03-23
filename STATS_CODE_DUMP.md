# Hockey App — Stats Code Dump
Copy everything below and paste into Claude.

---

## FILE: src/components/Stats.tsx

```tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Trophy, Award } from 'lucide-react'
import { fetchTeamStats, PlayerStats } from '../api/api'

interface StatsProps {
  teamId: string
}

export default function Stats({ teamId }: StatsProps) {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [teamId])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTeamStats(teamId)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-ice-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-ice-200 text-lg">Loading stats...</p>
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

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Season Statistics</h2>
          <p className="text-ice-200 text-lg">Player performance & team analytics</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 glass-strong px-6 py-3 rounded-lg border border-white/20 shadow-lg"
        >
          <Trophy className="w-5 h-5 text-ice-400" />
          <span className="font-bold text-white text-lg">{stats.length} Players</span>
        </motion.div>
      </motion.div>

      {stats.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-20 h-20 text-ice-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">No stats recorded yet</h3>
          <p className="text-ice-200">Record game stats to see player performance data</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">GP</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">G</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">A</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider bg-ice-500/20">PTS</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">SOG</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">BLK</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">PIM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.map((player, index) => {
                  const isTopThree = index < 3
                  const rankColors = [
                    'from-yellow-500/30 to-amber-500/30 border-l-4 border-yellow-400',
                    'from-gray-400/30 to-gray-500/30 border-l-4 border-gray-400',
                    'from-orange-500/30 to-amber-700/30 border-l-4 border-orange-500'
                  ]
                  return (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className={`${isTopThree ? `bg-gradient-to-r ${rankColors[index]}` : ''} cursor-pointer transition-all`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}><Trophy className="w-5 h-5 text-yellow-400 mr-2" /></motion.div>}
                          {index === 1 && <Award className="w-5 h-5 text-gray-400 mr-2" />}
                          {index === 2 && <Award className="w-5 h-5 text-orange-400 mr-2" />}
                          <span className="text-sm font-bold text-white">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-ice-500 to-ice-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-lg">
                            {player.jersey_number}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {player.first_name} {player.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-ice-200 font-medium capitalize">{player.position.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-semibold">
                        {player.games_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">
                        {player.total_goals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">
                        {player.total_assists}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm bg-ice-500/20">
                        <motion.span
                          whileHover={{ scale: 1.2 }}
                          className="inline-block font-black text-ice-300 text-xl"
                        >
                          {player.total_points}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_shots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_blocks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_pims}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
```

---

## FILE: src/components/StatsEntryModal.tsx

```tsx
import { useState, useEffect } from 'react'
import { X, Save, CheckCircle } from 'lucide-react'
import { fetchPlayers, recordGameStats, Player } from '../api/api'

interface StatsEntryModalProps {
  gameId: string
  teamId: string
  gameName: string
  onClose: () => void
  onSuccess: () => void
}

interface PlayerStatInput {
  playerId: string
  goals: number
  assists: number
  shots: number
  blocks: number
  pims: number
}

export default function StatsEntryModal({ gameId, teamId, gameName, onClose, onSuccess }: StatsEntryModalProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [stats, setStats] = useState<Record<string, PlayerStatInput>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPlayers()
  }, [teamId])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const playersData = await fetchPlayers(teamId)
      setPlayers(playersData)
      
      const initialStats: Record<string, PlayerStatInput> = {}
      playersData.forEach(player => {
        initialStats[player.id] = {
          playerId: player.id,
          goals: 0,
          assists: 0,
          shots: 0,
          blocks: 0,
          pims: 0
        }
      })
      setStats(initialStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
      console.error('Error loading players:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateStat = (playerId: string, field: keyof Omit<PlayerStatInput, 'playerId'>, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    setStats(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: numValue
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      const statsArray = Object.values(stats).filter(stat => 
        stat.goals > 0 || stat.assists > 0 || stat.shots > 0 || stat.blocks > 0 || stat.pims > 0
      )
      
      await recordGameStats(gameId, statsArray)
      
      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stats')
      console.error('Error saving stats:', err)
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Stats Saved!</h3>
          <p className="text-gray-600">Box score has been recorded successfully.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Record Box Score</h2>
            <p className="text-sm text-gray-600 mt-1">{gameName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Header - Sticky */}
              <div className="grid grid-cols-7 gap-2 font-semibold text-sm text-gray-700 pb-2 border-b-2 border-gray-300 sticky top-0 bg-white">
                <div className="col-span-2">Player</div>
                <div className="text-center">Goals</div>
                <div className="text-center">Assists</div>
                <div className="text-center">Shots</div>
                <div className="text-center">Blocks</div>
                <div className="text-center">PIMs</div>
              </div>

              {/* Player Rows */}
              {players.map(player => (
                <div key={player.id} className="grid grid-cols-7 gap-2 items-center py-2 hover:bg-gray-50 rounded-lg px-2">
                  <div className="col-span-2 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {player.jerseyNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{player.position.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={stats[player.id]?.goals || 0}
                    onChange={(e) => updateStat(player.id, 'goals', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="number"
                    min="0"
                    value={stats[player.id]?.assists || 0}
                    onChange={(e) => updateStat(player.id, 'assists', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="number"
                    min="0"
                    value={stats[player.id]?.shots || 0}
                    onChange={(e) => updateStat(player.id, 'shots', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="number"
                    min="0"
                    value={stats[player.id]?.blocks || 0}
                    onChange={(e) => updateStat(player.id, 'blocks', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <input
                    type="number"
                    min="0"
                    value={stats[player.id]?.pims || 0}
                    onChange={(e) => updateStat(player.id, 'pims', e.target.value)}
                    className="w-full px-2 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Box Score'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## FILE: src/api/api.ts (stats-related types and functions only)

```ts
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
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ stats }),
  });
  if (!response.ok) {
    throw new Error(`Failed to record stats: ${response.statusText}`);
  }
}
```

---

## FILE: backend/routes/statsRoutes.js

```js
const express = require('express');
const router = express.Router();
const { getTeamStats, getGameStats, recordGameStats } = require('../controllers/statsController');

router.get('/:teamId/stats', getTeamStats);
router.get('/games/:gameId/stats', getGameStats);
router.post('/games/:gameId/stats', recordGameStats);

module.exports = router;
```

---

## FILE: backend/controllers/statsController.js

```js
const { getPlayerStatsByTeamId, getStatsByGameId, createBulkPlayerStats } = require('../models/statsModel');
const { v4: uuidv4 } = require('uuid');

const getTeamStats = async (req, res) => {
  try {
    const { teamId } = req.params;
    const stats = await getPlayerStatsByTeamId(teamId);
    res.json({ stats });
  } catch (error) {
    console.error('Error in getTeamStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getGameStats = async (req, res) => {
  try {
    const { gameId } = req.params;
    const stats = await getStatsByGameId(gameId);
    res.json({ stats });
  } catch (error) {
    console.error('Error in getGameStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const recordGameStats = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { stats } = req.body;

    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ error: 'Stats array is required' });
    }

    const statsWithIds = stats.map(stat => ({
      id: uuidv4(),
      playerId: stat.playerId,
      gameId,
      goals: stat.goals || 0,
      assists: stat.assists || 0,
      shots: stat.shots || 0,
      blocks: stat.blocks || 0,
      pims: stat.pims || 0
    }));

    await createBulkPlayerStats(statsWithIds);
    res.status(201).json({ message: 'Stats recorded successfully', count: statsWithIds.length });
  } catch (error) {
    console.error('Error in recordGameStats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTeamStats,
  getGameStats,
  recordGameStats
};
```

---

## FILE: backend/models/statsModel.js

```js
const { getDb, saveDb } = require('../db/database');

const getPlayerStatsByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.jersey_number,
      p.position,
      COALESCE(SUM(ps.goals), 0) as total_goals,
      COALESCE(SUM(ps.assists), 0) as total_assists,
      COALESCE(SUM(ps.goals) + SUM(ps.assists), 0) as total_points,
      COALESCE(SUM(ps.shots), 0) as total_shots,
      COALESCE(SUM(ps.blocks), 0) as total_blocks,
      COALESCE(SUM(ps.pims), 0) as total_pims,
      COUNT(DISTINCT ps.game_id) as games_played
    FROM players p
    LEFT JOIN player_stats ps ON p.id = ps.player_id
    WHERE p.team_id = ?
    GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.position
    ORDER BY total_points DESC, total_goals DESC, p.last_name ASC
  `, [teamId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const stats = {};
    columns.forEach((col, i) => stats[col] = row[i]);
    return stats;
  });
};

const getStatsByGameId = async (gameId) => {
  const db = await getDb();
  const result = db.exec(`
    SELECT 
      ps.*,
      p.first_name,
      p.last_name,
      p.jersey_number,
      p.position
    FROM player_stats ps
    JOIN players p ON ps.player_id = p.id
    WHERE ps.game_id = ?
    ORDER BY (ps.goals + ps.assists) DESC
  `, [gameId]);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const stat = {};
    columns.forEach((col, i) => stat[col] = row[i]);
    return stat;
  });
};

const createPlayerStats = async (statsData) => {
  const db = await getDb();
  const { id, playerId, gameId, goals, assists, shots, blocks, pims } = statsData;
  
  db.run(
    `INSERT INTO player_stats (id, player_id, game_id, goals, assists, shots, blocks, pims) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, playerId, gameId, goals || 0, assists || 0, shots || 0, blocks || 0, pims || 0]
  );
  
  await saveDb();
  return { id, playerId, gameId, goals, assists, shots, blocks, pims };
};

const createBulkPlayerStats = async (statsArray) => {
  const db = await getDb();
  
  statsArray.forEach(stat => {
    db.run(
      `INSERT INTO player_stats (id, player_id, game_id, goals, assists, shots, blocks, pims) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [stat.id, stat.playerId, stat.gameId, stat.goals || 0, stat.assists || 0, stat.shots || 0, stat.blocks || 0, stat.pims || 0]
    );
  });
  
  await saveDb();
  return statsArray;
};

module.exports = {
  getPlayerStatsByTeamId,
  getStatsByGameId,
  createPlayerStats,
  createBulkPlayerStats
};
```

---

## FILE: backend/db/migrate.js (player_stats table only)

```sql
CREATE TABLE IF NOT EXISTS player_stats (
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
)
```

---

## FILE: backend/db/seed.js (stats seed data only)

```js
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
```
