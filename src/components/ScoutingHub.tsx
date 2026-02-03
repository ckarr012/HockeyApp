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
