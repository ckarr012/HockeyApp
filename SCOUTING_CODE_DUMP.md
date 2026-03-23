# Hockey App — Scouting & Recruiting Code Dump
Copy everything below and paste into Claude.

---

## FILE: src/components/ScoutingHub.tsx

```tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Edit2, Shield, TrendingUp, TrendingDown, Target, User as UserIcon, X, Save } from 'lucide-react'
import { fetchGames, fetchScoutingReports, fetchScoutingReportByGame, createScoutingReport, updateScoutingReport, Game, ScoutingReport, KeyPlayer } from '../api/api'
import { format, parseISO } from 'date-fns'

interface ScoutingHubProps {
  teamId: string
}

export default function ScoutingHub({ teamId }: ScoutingHubProps) {
  const [games, setGames] = useState<Game[]>([])
  const [reports, setReports] = useState<ScoutingReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [editingReport, setEditingReport] = useState<ScoutingReport | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [tacticalNotes, setTacticalNotes] = useState('')
  const [powerPlayTendency, setPowerPlayTendency] = useState('')
  const [goalieWeakness, setGoalieWeakness] = useState('')
  const [keyPlayers, setKeyPlayers] = useState<KeyPlayer[]>([
    { name: '', number: 0, position: '', notes: '' },
    { name: '', number: 0, position: '', notes: '' },
    { name: '', number: 0, position: '', notes: '' }
  ])

  useEffect(() => {
    loadData()
  }, [teamId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [gamesData, reportsData] = await Promise.all([
        fetchGames(teamId),
        fetchScoutingReports(teamId)
      ])
      setGames(gamesData.filter(g => g.status === 'scheduled'))
      setReports(reportsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateReport = (game: Game) => {
    setSelectedGame(game)
    setEditingReport(null)
    resetForm()
    setShowForm(true)
  }

  const handleEditReport = async (game: Game) => {
    try {
      const report = await fetchScoutingReportByGame(game.id, teamId)
      if (report) {
        setSelectedGame(game)
        setEditingReport(report)
        loadReportIntoForm(report)
        setShowForm(true)
      }
    } catch (err) {
      alert('Failed to load report')
      console.error('Error loading report:', err)
    }
  }

  const loadReportIntoForm = (report: ScoutingReport) => {
    setStrengths(report.strengths || '')
    setWeaknesses(report.weaknesses || '')
    setTacticalNotes(report.tacticalNotes || '')
    setPowerPlayTendency(report.powerPlayTendency || '')
    setGoalieWeakness(report.goalieWeakness || '')
    
    if (report.keyPlayersJson) {
      try {
        const parsed = JSON.parse(report.keyPlayersJson)
        setKeyPlayers(parsed.length === 3 ? parsed : [
          ...parsed,
          ...Array(3 - parsed.length).fill({ name: '', number: 0, position: '', notes: '' })
        ])
      } catch {
        resetKeyPlayers()
      }
    } else {
      resetKeyPlayers()
    }
  }

  const resetForm = () => {
    setStrengths('')
    setWeaknesses('')
    setTacticalNotes('')
    setPowerPlayTendency('')
    setGoalieWeakness('')
    resetKeyPlayers()
  }

  const resetKeyPlayers = () => {
    setKeyPlayers([
      { name: '', number: 0, position: '', notes: '' },
      { name: '', number: 0, position: '', notes: '' },
      { name: '', number: 0, position: '', notes: '' }
    ])
  }

  const updateKeyPlayer = (index: number, field: keyof KeyPlayer, value: string | number) => {
    const updated = [...keyPlayers]
    updated[index] = { ...updated[index], [field]: value }
    setKeyPlayers(updated)
  }

  const handleSave = async () => {
    if (!selectedGame) return

    try {
      setSaving(true)
      
      const reportData = {
        game_id: selectedGame.id,
        opponent_name: selectedGame.opponent,
        date: selectedGame.gameDate,
        strengths,
        weaknesses,
        key_players: keyPlayers.filter(kp => kp.name.trim() !== ''),
        tactical_notes: tacticalNotes,
        power_play_tendency: powerPlayTendency,
        goalie_weakness: goalieWeakness
      }

      if (editingReport) {
        await updateScoutingReport(editingReport.id, reportData)
      } else {
        await createScoutingReport(teamId, reportData)
      }

      await loadData()
      setShowForm(false)
      resetForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save report')
      console.error('Error saving report:', err)
    } finally {
      setSaving(false)
    }
  }

  const getReportForGame = (gameId: string) => {
    return reports.find(r => r.gameId === gameId)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scouting hub...</p>
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
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Scouting Hub</h2>
          <p className="text-ice-200 mt-1 text-lg">Opponent analysis and tactical preparation</p>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <Shield className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-800">Confidential</span>
        </div>
      </div>

      <div className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Opponent</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">Report Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {games.map((game) => {
                const report = getReportForGame(game.id)
                return (
                  <motion.tr
                    key={game.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 text-ice-400 mr-2" />
                        <span className="font-bold text-white">{game.opponent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ice-200 font-medium">
                      <div className="text-sm font-medium text-gray-900">{format(parseISO(game.gameDate), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-gray-500">
                        {format(parseISO(game.gameDate), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{game.location}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {game.homeAway === 'home' ? '🏠 Home' : '🚌 Away'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {report ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                          <Target className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report ? (
                        <motion.button
                          onClick={() => handleEditReport(game)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-ice-400 hover:text-ice-300 font-bold flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit Report
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleCreateReport(game)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-green-400 hover:text-green-300 font-bold flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Create Report
                        </motion.button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scouting Report Form Modal */}
      <AnimatePresence>
        {showForm && selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-4xl w-full my-8 border border-white/20">
            {/* Header */}
            <div className="px-6 py-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6" />
                <div>
                  <h3 className="text-xl font-bold">Scouting Report</h3>
                  <p className="text-sm opacity-90">{selectedGame.opponent} • {format(parseISO(selectedGame.gameDate), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Key Players Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <span>Top 3 Key Players to Watch</span>
                </h4>
                <div className="space-y-4">
                  {keyPlayers.map((player, index) => (
                    <div key={index} className="grid grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="Player Name"
                        value={player.name}
                        onChange={(e) => updateKeyPlayer(index, 'name', e.target.value)}
                        className="col-span-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        placeholder="#"
                        value={player.number || ''}
                        onChange={(e) => updateKeyPlayer(index, 'number', parseInt(e.target.value) || 0)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={player.position}
                        onChange={(e) => updateKeyPlayer(index, 'position', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Notes"
                        value={player.notes}
                        onChange={(e) => updateKeyPlayer(index, 'notes', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>Team Strengths</span>
                  </label>
                  <textarea
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    rows={4}
                    placeholder="What are they good at?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span>Team Weaknesses</span>
                  </label>
                  <textarea
                    value={weaknesses}
                    onChange={(e) => setWeaknesses(e.target.value)}
                    rows={4}
                    placeholder="What can we exploit?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Power Play Tendency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-orange-600" />
                  <span>Power Play Tendencies</span>
                </label>
                <textarea
                  value={powerPlayTendency}
                  onChange={(e) => setPowerPlayTendency(e.target.value)}
                  rows={3}
                  placeholder="Formation, key plays, setup..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Goalie Weakness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Goalie Weaknesses</span>
                </label>
                <textarea
                  value={goalieWeakness}
                  onChange={(e) => setGoalieWeakness(e.target.value)}
                  rows={3}
                  placeholder="Glove side, blocker, five-hole, positioning..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tactical Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game Plan & Tactical Notes</label>
                <textarea
                  value={tacticalNotes}
                  onChange={(e) => setTacticalNotes(e.target.value)}
                  rows={4}
                  placeholder="How should we approach this game?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : editingReport ? 'Update Report' : 'Save Report'}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
```

---

## FILE: src/api/api.ts (scouting + recruiting types and functions)

```ts
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

// --- Scouting API functions ---

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

// --- Recruiting/Prospect API functions ---

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
  const response = await fetch(`${API_BASE_URL}/prospects/${prospectId}?teamId=${teamId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete prospect: ${response.statusText}`);
  }
}
```

---

## FILE: backend/routes/scoutingRoutes.js

```js
const express = require('express');
const router = express.Router();
const {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/scoutingController');

router.get('/:teamId/scouting', getReports);
router.get('/scouting/games/:gameId', getReportByGame);
router.post('/:teamId/scouting', createReport);
router.put('/scouting/:reportId', updateReport);
router.delete('/scouting/:reportId', deleteReport);

module.exports = router;
```

---

## FILE: backend/routes/recruitingRoutes.js

```js
const express = require('express');
const router = express.Router();
const recruitingController = require('../controllers/recruitingController');

router.get('/teams/:teamId/prospects', recruitingController.getProspects);
router.get('/prospects/:prospectId', recruitingController.getProspectDetails);
router.post('/teams/:teamId/prospects', recruitingController.addProspect);
router.put('/prospects/:prospectId', recruitingController.updateProspectDetails);
router.delete('/prospects/:prospectId', recruitingController.removeProspect);

router.post('/prospects/:prospectId/videos', recruitingController.addProspectVideo);
router.delete('/prospect-videos/:videoId', recruitingController.removeProspectVideo);

module.exports = router;
```

---

## FILE: backend/controllers/scoutingController.js

```js
const { v4: uuidv4 } = require('uuid');
const {
  getScoutingReportsByTeam,
  getScoutingReportByGame,
  getScoutingReportById,
  createScoutingReport,
  updateScoutingReport,
  deleteScoutingReport
} = require('../models/scoutingModel');
const { getTeamById } = require('../models/teamModel');

const getReports = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const reports = await getScoutingReportsByTeam(teamId);
    res.json({ reports });
  } catch (error) {
    console.error('Error in getReports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getReportByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamId } = req.query;

    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }

    const report = await getScoutingReportByGame(gameId, teamId);
    res.json({ report });
  } catch (error) {
    console.error('Error in getReportByGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createReport = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { game_id, opponent_name, date, strengths, weaknesses, key_players, tactical_notes, power_play_tendency, goalie_weakness } = req.body;

    if (!game_id || !opponent_name || !date) {
      return res.status(400).json({ error: 'Game ID, opponent name, and date are required' });
    }

    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if report already exists for this game
    const existingReport = await getScoutingReportByGame(game_id, teamId);
    if (existingReport) {
      return res.status(409).json({ error: 'Scouting report already exists for this game' });
    }

    const reportData = {
      id: uuidv4(),
      team_id: teamId,
      game_id,
      opponent_name,
      date,
      strengths,
      weaknesses,
      key_players_json: key_players ? JSON.stringify(key_players) : null,
      tactical_notes,
      power_play_tendency,
      goalie_weakness
    };

    const report = await createScoutingReport(reportData);
    res.status(201).json({ report });
  } catch (error) {
    console.error('Error in createReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { strengths, weaknesses, key_players, tactical_notes, power_play_tendency, goalie_weakness } = req.body;

    const existingReport = await getScoutingReportById(reportId);
    if (!existingReport) {
      return res.status(404).json({ error: 'Scouting report not found' });
    }

    const reportData = {
      strengths,
      weaknesses,
      key_players_json: key_players ? JSON.stringify(key_players) : existingReport.key_players_json,
      tactical_notes,
      power_play_tendency,
      goalie_weakness
    };

    const report = await updateScoutingReport(reportId, reportData);
    res.json({ report });
  } catch (error) {
    console.error('Error in updateReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const existingReport = await getScoutingReportById(reportId);
    if (!existingReport) {
      return res.status(404).json({ error: 'Scouting report not found' });
    }

    await deleteScoutingReport(reportId);
    res.json({ message: 'Scouting report deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReport:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getReports,
  getReportByGame,
  createReport,
  updateReport,
  deleteReport
};
```

---

## FILE: backend/controllers/recruitingController.js

```js
const { v4: uuidv4 } = require('uuid');
const recruitingModel = require('../models/recruitingModel');

const getProspects = async (req, res) => {
  try {
    const { teamId } = req.params;
    const prospects = await recruitingModel.getProspectsByTeam(teamId);
    res.json({ prospects });
  } catch (error) {
    console.error('Error fetching prospects:', error);
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
};

const getProspectDetails = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId } = req.query;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    const prospect = await recruitingModel.getProspectById(prospectId, teamId);
    
    if (!prospect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const videos = await recruitingModel.getVideosByProspect(prospectId);
    
    res.json({ 
      prospect,
      videos
    });
  } catch (error) {
    console.error('Error fetching prospect details:', error);
    res.status(500).json({ error: 'Failed to fetch prospect details' });
  }
};

const addProspect = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, position, gradYear, currentTeam, scoutRating, contactInfo, status, coachingNotes } = req.body;
    
    if (!name || !position || !gradYear) {
      return res.status(400).json({ error: 'Name, position, and graduation year are required' });
    }
    
    if (scoutRating && (scoutRating < 1 || scoutRating > 5)) {
      return res.status(400).json({ error: 'Scout rating must be between 1 and 5' });
    }
    
    const validStatuses = ['Watching', 'Contacted', 'Offered', 'Committed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const prospectData = {
      id: uuidv4(),
      team_id: teamId,
      name,
      position,
      grad_year: gradYear,
      current_team: currentTeam,
      scout_rating: scoutRating,
      contact_info: contactInfo,
      status: status || 'Watching',
      coaching_notes: coachingNotes
    };
    
    const newProspect = await recruitingModel.createProspect(prospectData);
    res.status(201).json({ prospect: newProspect });
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({ error: 'Failed to create prospect' });
  }
};

const updateProspectDetails = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId, name, position, gradYear, currentTeam, scoutRating, contactInfo, status, coachingNotes } = req.body;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    if (scoutRating && (scoutRating < 1 || scoutRating > 5)) {
      return res.status(400).json({ error: 'Scout rating must be between 1 and 5' });
    }
    
    const validStatuses = ['Watching', 'Contacted', 'Offered', 'Committed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const prospectData = {
      name,
      position,
      grad_year: gradYear,
      current_team: currentTeam,
      scout_rating: scoutRating,
      contact_info: contactInfo,
      status,
      coaching_notes: coachingNotes
    };
    
    const updatedProspect = await recruitingModel.updateProspect(prospectId, prospectData);
    res.json({ prospect: updatedProspect });
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({ error: 'Failed to update prospect' });
  }
};

const removeProspect = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId } = req.query;
    
    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }
    
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    await recruitingModel.deleteProspect(prospectId);
    res.json({ message: 'Prospect deleted successfully' });
  } catch (error) {
    console.error('Error deleting prospect:', error);
    res.status(500).json({ error: 'Failed to delete prospect' });
  }
};

const addProspectVideo = async (req, res) => {
  try {
    const { prospectId } = req.params;
    const { teamId, title, videoUrl } = req.body;
    
    if (!teamId || !title || !videoUrl) {
      return res.status(400).json({ error: 'teamId, title, and videoUrl are required' });
    }
    
    const existingProspect = await recruitingModel.getProspectById(prospectId, teamId);
    if (!existingProspect) {
      return res.status(404).json({ error: 'Prospect not found' });
    }
    
    const videoData = {
      id: uuidv4(),
      prospect_id: prospectId,
      title,
      video_url: videoUrl
    };
    
    const newVideo = await recruitingModel.createProspectVideo(videoData);
    res.status(201).json({ video: newVideo });
  } catch (error) {
    console.error('Error adding prospect video:', error);
    res.status(500).json({ error: 'Failed to add prospect video' });
  }
};

const removeProspectVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    await recruitingModel.deleteProspectVideo(videoId);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
};

module.exports = {
  getProspects,
  getProspectDetails,
  addProspect,
  updateProspectDetails,
  removeProspect,
  addProspectVideo,
  removeProspectVideo
};
```

---

## FILE: backend/models/scoutingModel.js

```js
const { getDb, saveDb } = require('../db/database');

const getScoutingReportsByTeam = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE team_id = ? ORDER BY date DESC', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const report = {};
    columns.forEach((col, i) => report[col] = row[i]);
    return {
      id: report.id,
      teamId: report.team_id,
      gameId: report.game_id,
      opponentName: report.opponent_name,
      date: report.date,
      strengths: report.strengths,
      weaknesses: report.weaknesses,
      keyPlayersJson: report.key_players_json,
      tacticalNotes: report.tactical_notes,
      powerPlayTendency: report.power_play_tendency,
      goalieWeakness: report.goalie_weakness,
      createdAt: report.created_at,
      updatedAt: report.updated_at
    };
  });
};

const getScoutingReportByGame = async (gameId, teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE game_id = ? AND team_id = ?', [gameId, teamId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const report = {};
  columns.forEach((col, i) => report[col] = values[i]);
  
  return {
    id: report.id,
    teamId: report.team_id,
    gameId: report.game_id,
    opponentName: report.opponent_name,
    date: report.date,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    keyPlayersJson: report.key_players_json,
    tacticalNotes: report.tactical_notes,
    powerPlayTendency: report.power_play_tendency,
    goalieWeakness: report.goalie_weakness,
    createdAt: report.created_at,
    updatedAt: report.updated_at
  };
};

const getScoutingReportById = async (reportId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM scouting_reports WHERE id = ?', [reportId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const report = {};
  columns.forEach((col, i) => report[col] = values[i]);
  
  return {
    id: report.id,
    teamId: report.team_id,
    gameId: report.game_id,
    opponentName: report.opponent_name,
    date: report.date,
    strengths: report.strengths,
    weaknesses: report.weaknesses,
    keyPlayersJson: report.key_players_json,
    tacticalNotes: report.tactical_notes,
    powerPlayTendency: report.power_play_tendency,
    goalieWeakness: report.goalie_weakness,
    createdAt: report.created_at,
    updatedAt: report.updated_at
  };
};

const createScoutingReport = async (reportData) => {
  const db = await getDb();
  const { id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness } = reportData;
  
  db.run(
    `INSERT INTO scouting_reports (id, team_id, game_id, opponent_name, date, strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, team_id, game_id, opponent_name, date, strengths || null, weaknesses || null, key_players_json || null, tactical_notes || null, power_play_tendency || null, goalie_weakness || null]
  );
  
  await saveDb();
  return { id, ...reportData };
};

const updateScoutingReport = async (reportId, reportData) => {
  const db = await getDb();
  const { strengths, weaknesses, key_players_json, tactical_notes, power_play_tendency, goalie_weakness } = reportData;
  
  db.run(
    `UPDATE scouting_reports 
     SET strengths = ?, weaknesses = ?, key_players_json = ?, tactical_notes = ?, power_play_tendency = ?, goalie_weakness = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [strengths || null, weaknesses || null, key_players_json || null, tactical_notes || null, power_play_tendency || null, goalie_weakness || null, reportId]
  );
  
  await saveDb();
  return { id: reportId, ...reportData };
};

const deleteScoutingReport = async (reportId) => {
  const db = await getDb();
  db.run('DELETE FROM scouting_reports WHERE id = ?', [reportId]);
  await saveDb();
};

module.exports = {
  getScoutingReportsByTeam,
  getScoutingReportByGame,
  getScoutingReportById,
  createScoutingReport,
  updateScoutingReport,
  deleteScoutingReport
};
```

---

## FILE: backend/models/recruitingModel.js

```js
const { getDb, saveDb } = require('../db/database');

const getProspectsByTeam = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospects WHERE team_id = ? ORDER BY grad_year ASC, scout_rating DESC', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const prospect = {};
    columns.forEach((col, i) => prospect[col] = row[i]);
    return {
      id: prospect.id,
      teamId: prospect.team_id,
      name: prospect.name,
      position: prospect.position,
      gradYear: prospect.grad_year,
      currentTeam: prospect.current_team,
      scoutRating: prospect.scout_rating,
      contactInfo: prospect.contact_info,
      status: prospect.status,
      coachingNotes: prospect.coaching_notes,
      createdAt: prospect.created_at,
      updatedAt: prospect.updated_at
    };
  });
};

const getProspectById = async (prospectId, teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospects WHERE id = ? AND team_id = ?', [prospectId, teamId]);
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const values = result[0].values[0];
  const prospect = {};
  columns.forEach((col, i) => prospect[col] = values[i]);
  
  return {
    id: prospect.id,
    teamId: prospect.team_id,
    name: prospect.name,
    position: prospect.position,
    gradYear: prospect.grad_year,
    currentTeam: prospect.current_team,
    scoutRating: prospect.scout_rating,
    contactInfo: prospect.contact_info,
    status: prospect.status,
    coachingNotes: prospect.coaching_notes,
    createdAt: prospect.created_at,
    updatedAt: prospect.updated_at
  };
};

const createProspect = async (prospectData) => {
  const db = await getDb();
  const { id, team_id, name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes } = prospectData;
  
  db.run(
    `INSERT INTO prospects (id, team_id, name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, team_id, name, position, grad_year, current_team || null, scout_rating || null, contact_info || null, status || 'Watching', coaching_notes || null]
  );
  
  await saveDb();
  return { id, ...prospectData };
};

const updateProspect = async (prospectId, prospectData) => {
  const db = await getDb();
  const { name, position, grad_year, current_team, scout_rating, contact_info, status, coaching_notes } = prospectData;
  
  db.run(
    `UPDATE prospects 
     SET name = ?, position = ?, grad_year = ?, current_team = ?, scout_rating = ?, contact_info = ?, status = ?, coaching_notes = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [name, position, grad_year, current_team || null, scout_rating || null, contact_info || null, status, coaching_notes || null, prospectId]
  );
  
  await saveDb();
  return { id: prospectId, ...prospectData };
};

const deleteProspect = async (prospectId) => {
  const db = await getDb();
  db.run('DELETE FROM prospects WHERE id = ?', [prospectId]);
  await saveDb();
};

const getVideosByProspect = async (prospectId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM prospect_videos WHERE prospect_id = ? ORDER BY created_at DESC', [prospectId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const video = {};
    columns.forEach((col, i) => video[col] = row[i]);
    return {
      id: video.id,
      prospectId: video.prospect_id,
      title: video.title,
      videoUrl: video.video_url,
      createdAt: video.created_at
    };
  });
};

const createProspectVideo = async (videoData) => {
  const db = await getDb();
  const { id, prospect_id, title, video_url } = videoData;
  
  db.run(
    `INSERT INTO prospect_videos (id, prospect_id, title, video_url)
     VALUES (?, ?, ?, ?)`,
    [id, prospect_id, title, video_url]
  );
  
  await saveDb();
  return { id, ...videoData };
};

const deleteProspectVideo = async (videoId) => {
  const db = await getDb();
  db.run('DELETE FROM prospect_videos WHERE id = ?', [videoId]);
  await saveDb();
};

module.exports = {
  getProspectsByTeam,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
  getVideosByProspect,
  createProspectVideo,
  deleteProspectVideo
};
```

---

## FILE: backend/db/migrate.js (scouting-related tables)

```sql
-- Table: scouting_reports
CREATE TABLE IF NOT EXISTS scouting_reports (
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
)

-- Table: prospects
CREATE TABLE IF NOT EXISTS prospects (
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
)

-- Table: prospect_videos
CREATE TABLE IF NOT EXISTS prospect_videos (
  id TEXT PRIMARY KEY,
  prospect_id TEXT NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prospect_id) REFERENCES prospects(id) ON DELETE CASCADE
)
```

---

## FILE: backend/db/seed.js (scouting + recruiting seed data)

```js
// --- Scouting Reports ---

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

// --- Prospects ---

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

// --- Prospect Videos ---

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
```

---

## Architecture Notes

- **Scouting has two separate systems**: opponent scouting reports (`ScoutingHub.tsx`) and prospect recruiting (no dedicated frontend component yet — API exists but no UI beyond what ScoutingHub covers)
- **ScoutingHub.tsx only shows scheduled games** — filters `games.filter(g => g.status === 'scheduled')` so completed games don't appear
- **The scouting form modal uses light-mode styling** (gray-50 backgrounds, gray-300 borders, blue-600 buttons) — doesn't match the app's dark glass design
- **Scouting routes** live in `scoutingRoutes.js`, recruiting/prospect routes in `recruitingRoutes.js` — separate files and controllers
- **3 DB tables**: `scouting_reports` (opponent analysis per game), `prospects` (recruitment pipeline with status tracking + 1-5 rating), `prospect_videos` (linked highlight reels)
- **Key players** are stored as JSON string in `key_players_json` column, parsed/stringified on read/write
- **Prospect statuses**: `Watching` → `Contacted` → `Offered` → `Committed` (pipeline)
- **Prospect videos** have ON DELETE CASCADE from prospects table
- **No delete endpoint used in ScoutingHub UI** — `deleteReport` exists in backend but no button in the frontend
