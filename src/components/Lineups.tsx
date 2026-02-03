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
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Lineup Builder</h2>
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

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-6">{editingLineup.name}</h3>
        
        <div className="space-y-6">
          {/* Forwards */}
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Forwards
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Left Wing</label>
                <select
                  value={editingLineup.lw_id || ''}
                  onChange={(e) => updatePosition('lw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Player</option>
                  {getPlayersByPosition('wing').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      className={p.status === 'injured' ? 'text-red-600' : ''}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center</label>
                <select
                  value={editingLineup.c_id || ''}
                  onChange={(e) => updatePosition('c', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Player</option>
                  {getPlayersByPosition('center').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      className={p.status === 'injured' ? 'text-red-600' : ''}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Right Wing</label>
                <select
                  value={editingLineup.rw_id || ''}
                  onChange={(e) => updatePosition('rw', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Player</option>
                  {getPlayersByPosition('wing').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      className={p.status === 'injured' ? 'text-red-600' : ''}
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
          <div className="border-b pb-6">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Defense</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Left Defense</label>
                <select
                  value={editingLineup.ld_id || ''}
                  onChange={(e) => updatePosition('ld', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Player</option>
                  {getPlayersByPosition('defense').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      className={p.status === 'injured' ? 'text-red-600' : ''}
                    >
                      #{p.jerseyNumber} {p.firstName} {p.lastName}
                      {p.status === 'injured' && ' 🚑 INJURED'}
                      {p.status === 'day-to-day' && ' ⚠️ DTD'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Right Defense</label>
                <select
                  value={editingLineup.rd_id || ''}
                  onChange={(e) => updatePosition('rd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Player</option>
                  {getPlayersByPosition('defense').map(p => (
                    <option 
                      key={p.id} 
                      value={p.id}
                      disabled={p.status === 'injured'}
                      className={p.status === 'injured' ? 'text-red-600' : ''}
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
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Goalie</h4>
            <div className="w-full md:w-1/2">
              <select
                value={editingLineup.g_id || ''}
                onChange={(e) => updatePosition('g', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Player</option>
                {getPlayersByPosition('goalie').map(p => (
                  <option 
                    key={p.id} 
                    value={p.id}
                    disabled={p.status === 'injured'}
                    className={p.status === 'injured' ? 'text-red-600' : ''}
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
  )
}
