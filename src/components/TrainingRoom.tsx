import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Heart } from 'lucide-react'
import { fetchPlayers, updatePlayerStatus, Player } from '../api/api'
import LoadingSpinner from './LoadingSpinner'

interface TrainingRoomProps {
  teamId: string
}

export default function TrainingRoom({ teamId }: TrainingRoomProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [injuryNote, setInjuryNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPlayers()
  }, [teamId])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPlayers(teamId)
      setPlayers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
      console.error('Error loading players:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (playerId: string, newStatus: string) => {
    try {
      setSaving(true)
      const player = players.find(p => p.id === playerId)
      const note = newStatus === 'injured' ? (player?.injuryNote || '') : null
      
      await updatePlayerStatus(playerId, newStatus, note || undefined)
      await loadPlayers()
      
      if (newStatus === 'injured') {
        setEditingPlayer(playerId)
        setInjuryNote(note || '')
      } else {
        setEditingPlayer(null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
      console.error('Error updating status:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNote = async (playerId: string, status: string) => {
    try {
      setSaving(true)
      await updatePlayerStatus(playerId, status, injuryNote || undefined)
      await loadPlayers()
      setEditingPlayer(null)
      setInjuryNote('')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save injury note')
      console.error('Error saving note:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading training room..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="glass-strong border border-goal-500/30 rounded-lg p-6 bg-goal-500/10">
          <p className="text-goal-300 font-semibold text-lg">{error}</p>
        </div>
      </div>
    )
  }

  const activeCount = players.filter(p => p.status === 'active').length
  const injuredCount = players.filter(p => p.status === 'injured').length
  const dayToDayCount = players.filter(p => p.status === 'day-to-day').length

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow flex items-center gap-3">
            <Heart className="w-8 h-8 text-goal-400" />
            Training Room
          </h2>
          <p className="text-ice-200 mt-1">Player health & injury management</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="glass px-4 py-2 rounded-lg font-bold status-active"
          >
            {activeCount} Active
          </motion.div>
          {dayToDayCount > 0 && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass px-4 py-2 rounded-lg font-bold status-day-to-day"
            >
              {dayToDayCount} Day-to-Day
            </motion.div>
          )}
          {injuredCount > 0 && (
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="glass px-4 py-2 rounded-lg font-bold status-injured"
            >
              {injuredCount} Injured
            </motion.div>
          )}
        </div>
      </div>

      <div className="glass-strong rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Player</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden md:table-cell">Position</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden lg:table-cell">Injury Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((player, index) => (
                <motion.tr 
                  key={player.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/10 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-ice-500 to-ice-700 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-glow-blue">
                        {player.jerseyNumber}
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {player.firstName} {player.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="text-sm text-ice-200 capitalize">{player.position.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <select
                        value={player.status}
                        onChange={(e) => handleStatusChange(player.id, e.target.value)}
                        disabled={saving}
                        className={`px-4 py-2 rounded-full text-xs font-bold border-0 cursor-pointer disabled:opacity-50 transition-all ${
                          player.status === 'active' ? 'status-active' :
                          player.status === 'injured' ? 'status-injured' :
                          'status-day-to-day'
                        }`}
                        style={{ 
                          colorScheme: 'dark'
                        }}
                      >
                        <option value="active" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✓ Active</option>
                        <option value="day-to-day" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>⚠ Day-to-Day</option>
                        <option value="injured" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✕ Injured</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                    {player.status === 'injured' || player.status === 'day-to-day' ? (
                      <div className="space-y-2">
                        {editingPlayer === player.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={injuryNote}
                              onChange={(e) => setInjuryNote(e.target.value)}
                              placeholder="e.g., Lower body, out 2 weeks"
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500"
                            />
                            <button
                              onClick={() => handleSaveNote(player.id, player.status)}
                              disabled={saving}
                              className="px-3 py-2 bg-ice-500 text-white rounded-lg hover:bg-ice-600 text-sm font-semibold disabled:opacity-50 shadow-glow-blue"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingPlayer(null)
                                setInjuryNote('')
                              }}
                              disabled={saving}
                              className="px-3 py-2 glass text-ice-200 rounded-lg hover:bg-white/20 text-sm font-semibold disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-ice-100">
                              {player.injuryNote || <span className="text-ice-400 italic">No details</span>}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPlayer(player.id)
                                setInjuryNote(player.injuryNote || '')
                              }}
                              className="ml-2 text-sm text-ice-400 hover:text-ice-200 font-semibold"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-ice-400">—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Training Room Guide</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Active:</strong> Player is healthy and available for games</li>
              <li><strong>Day-to-Day:</strong> Minor injury, game-time decision</li>
              <li><strong>Injured:</strong> Out of lineup, requires recovery time</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
