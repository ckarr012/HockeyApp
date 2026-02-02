import { useState, useEffect } from 'react'
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { fetchPlayers, updatePlayerStatus, Player } from '../api/api'

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'injured':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'day-to-day':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      injured: 'bg-red-100 text-red-800',
      'day-to-day': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading training room...</p>
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

  const activeCount = players.filter(p => p.status === 'active').length
  const injuredCount = players.filter(p => p.status === 'injured').length
  const dayToDayCount = players.filter(p => p.status === 'day-to-day').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Training Room</h2>
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
            {activeCount} Active
          </div>
          {dayToDayCount > 0 && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
              {dayToDayCount} Day-to-Day
            </div>
          )}
          {injuredCount > 0 && (
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-semibold">
              {injuredCount} Injured
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Injury Note</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {player.jerseyNumber}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {player.firstName} {player.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 capitalize">{player.position.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(player.status)}
                      <select
                        value={player.status}
                        onChange={(e) => handleStatusChange(player.id, e.target.value)}
                        disabled={saving}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(player.status)} border-0 cursor-pointer disabled:opacity-50`}
                      >
                        <option value="active">Active</option>
                        <option value="day-to-day">Day-to-Day</option>
                        <option value="injured">Injured</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {player.status === 'injured' || player.status === 'day-to-day' ? (
                      <div className="space-y-2">
                        {editingPlayer === player.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={injuryNote}
                              onChange={(e) => setInjuryNote(e.target.value)}
                              placeholder="e.g., Lower body, out 2 weeks"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => handleSaveNote(player.id, player.status)}
                              disabled={saving}
                              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingPlayer(null)
                                setInjuryNote('')
                              }}
                              disabled={saving}
                              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900">
                              {player.injuryNote || <span className="text-gray-400 italic">No details</span>}
                            </span>
                            <button
                              onClick={() => {
                                setEditingPlayer(player.id)
                                setInjuryNote(player.injuryNote || '')
                              }}
                              className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                </tr>
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
