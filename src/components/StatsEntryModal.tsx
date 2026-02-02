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
