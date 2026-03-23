import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Plus, Trash2, Loader2, ChevronDown, X, AlertTriangle } from 'lucide-react'
import { fetchLineups, fetchPlayers, createLineup, updateLineup, deleteLineup, Player, Lineup } from '../api/api'
import LoadingSpinner from './LoadingSpinner'

interface LineupsProps {
  teamId: string
}

type Tab = 'forwards' | 'defense' | 'specialteams' | 'goalies'
type LocalSlots = Record<string, Record<string, string | null>>

const LINE_CONFIG = {
  forwards: [
    { key: 'forward_1', label: 'Line 1', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }] },
    { key: 'forward_2', label: 'Line 2', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }] },
    { key: 'forward_3', label: 'Line 3', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }] },
    { key: 'forward_4', label: 'Line 4', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }] },
  ],
  defense: [
    { key: 'defense_1', label: 'Pair 1', positions: [{ key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
    { key: 'defense_2', label: 'Pair 2', positions: [{ key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
    { key: 'defense_3', label: 'Pair 3', positions: [{ key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
  ],
  specialteams: [
    { key: 'pp1', label: 'PP1 — Power Play', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }, { key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
    { key: 'pp2', label: 'PP2 — Power Play', positions: [{ key: 'lw', label: 'LW' }, { key: 'c', label: 'C' }, { key: 'rw', label: 'RW' }, { key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
    { key: 'pk1', label: 'PK1 — Penalty Kill', positions: [{ key: 'f1', label: 'F1' }, { key: 'f2', label: 'F2' }, { key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
    { key: 'pk2', label: 'PK2 — Penalty Kill', positions: [{ key: 'f1', label: 'F1' }, { key: 'f2', label: 'F2' }, { key: 'ld', label: 'LD' }, { key: 'rd', label: 'RD' }] },
  ],
  goalies: [
    { key: 'goalies', label: 'Goalie Depth', positions: [{ key: 'starter', label: 'Starter' }, { key: 'backup', label: 'Backup' }] },
  ],
}

const TAB_COLORS: Record<Tab, string> = {
  forwards: 'from-ice-500 to-ice-600',
  defense: 'from-purple-500 to-purple-700',
  specialteams: 'from-yellow-500 to-amber-600',
  goalies: 'from-green-500 to-green-700',
}

const LINE_COLORS: Record<string, string> = {
  forward_1: 'border-ice-500/30 bg-ice-500/5',
  forward_2: 'border-ice-500/20 bg-ice-500/3',
  forward_3: 'border-ice-500/20 bg-ice-500/3',
  forward_4: 'border-ice-500/20 bg-ice-500/3',
  defense_1: 'border-purple-500/30 bg-purple-500/5',
  defense_2: 'border-purple-500/20 bg-purple-500/3',
  defense_3: 'border-purple-500/20 bg-purple-500/3',
  pp1: 'border-yellow-500/30 bg-yellow-500/5',
  pp2: 'border-yellow-500/20 bg-yellow-500/3',
  pk1: 'border-teal-500/30 bg-teal-500/5',
  pk2: 'border-teal-500/20 bg-teal-500/3',
  goalies: 'border-green-500/30 bg-green-500/5',
}

const extractSlotIds = (lineup: Lineup): LocalSlots => {
  const result: LocalSlots = {}
  if (!lineup.slots) return result
  for (const [lineType, positions] of Object.entries(lineup.slots)) {
    result[lineType] = {}
    for (const [pos, player] of Object.entries(positions as Record<string, any>)) {
      result[lineType][pos] = player?.id || null
    }
  }
  return result
}

const getPlayersForPosition = (players: Player[], posKey: string): Player[] => {
  const pos = posKey.toLowerCase()
  if (pos === 'lw' || pos === 'f1') return players.filter(p => ['left_wing', 'center', 'right_wing'].includes(p.position))
  if (pos === 'c') return players.filter(p => p.position === 'center')
  if (pos === 'rw' || pos === 'f2') return players.filter(p => ['right_wing', 'center', 'left_wing'].includes(p.position))
  if (pos === 'ld') return players.filter(p => ['left_defense', 'right_defense'].includes(p.position))
  if (pos === 'rd') return players.filter(p => ['right_defense', 'left_defense'].includes(p.position))
  if (pos === 'starter' || pos === 'backup') return players.filter(p => p.position === 'goalie')
  return players
}

export default function Lineups({ teamId }: LineupsProps) {
  const [lineups, setLineups] = useState<Lineup[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null)
  const [localSlots, setLocalSlots] = useState<LocalSlots>({})
  const [lineupName, setLineupName] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('forwards')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newLineupName, setNewLineupName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => { loadData() }, [teamId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lineupsData, playersData] = await Promise.all([fetchLineups(teamId), fetchPlayers(teamId)])
      setLineups(lineupsData)
      setPlayers(playersData)
      if (lineupsData.length > 0 && !selectedLineupId) {
        const first = lineupsData[0]
        setSelectedLineupId(first.id)
        setLocalSlots(extractSlotIds(first))
        setLineupName(first.name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const selectLineup = (lineup: Lineup) => {
    setSelectedLineupId(lineup.id)
    setLocalSlots(extractSlotIds(lineup))
    setLineupName(lineup.name)
    setSaved(false)
  }

  const handleSlotChange = (lineType: string, position: string, playerId: string) => {
    setLocalSlots(prev => ({ ...prev, [lineType]: { ...prev[lineType], [position]: playerId || null } }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!selectedLineupId) return
    try {
      setSaving(true)
      await updateLineup(selectedLineupId, lineupName, localSlots)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateLineup = async () => {
    if (!newLineupName.trim()) return
    try {
      setCreating(true)
      const newLineup = await createLineup(teamId, newLineupName.trim())
      const lineupsData = await fetchLineups(teamId)
      setLineups(lineupsData)
      const created = lineupsData.find(l => l.id === newLineup.id) || lineupsData[lineupsData.length - 1]
      if (created) { setSelectedLineupId(created.id); setLocalSlots(extractSlotIds(created)); setLineupName(created.name) }
      setNewLineupName('')
      setShowNewModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lineup')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteLineup = async () => {
    if (!selectedLineupId) return
    try {
      setDeleting(true)
      await deleteLineup(selectedLineupId)
      const remaining = lineups.filter(l => l.id !== selectedLineupId)
      setLineups(remaining)
      if (remaining.length > 0) { selectLineup(remaining[0]) } else { setSelectedLineupId(null); setLocalSlots({}); setLineupName('') }
      setShowDeleteConfirm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lineup')
    } finally {
      setDeleting(false)
    }
  }

  const selectedLineup = lineups.find(l => l.id === selectedLineupId) || null

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'forwards', label: 'Forwards', icon: '⚡' },
    { key: 'defense', label: 'Defense', icon: '🛡️' },
    { key: 'specialteams', label: 'Special Teams', icon: '⭐' },
    { key: 'goalies', label: 'Goalies', icon: '🥅' },
  ]

  if (loading) return <LoadingSpinner message="Loading lineups..." />

  if (error) return (
    <div className="p-8">
      <div className="glass-strong border border-goal-500/30 rounded-lg p-6 bg-goal-500/10">
        <p className="text-goal-300 font-semibold">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">🏒 Lineup Builder</h2>
          <p className="text-ice-200 mt-1">Build and manage your line combinations</p>
        </div>
        {selectedLineupId && (
          <motion.button
            whileHover={{ scale: saving ? 1 : 1.03 }}
            whileTap={{ scale: saving ? 1 : 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className={`px-5 py-2.5 rounded-lg font-semibold shadow-glow-blue transition-all flex items-center gap-2 disabled:opacity-60 bg-gradient-to-r ${saved ? 'from-green-500 to-green-600' : 'from-ice-500 to-ice-600'} text-white`}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✓' : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Lineup'}
          </motion.button>
        )}
      </div>

      {/* Lineup selector */}
      <div className="glass-strong rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-ice-400 uppercase tracking-wider shrink-0">Lineup:</span>
          <div className="flex items-center gap-2 flex-wrap flex-1">
            {lineups.map(lineup => (
              <button
                key={lineup.id}
                onClick={() => selectLineup(lineup)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedLineupId === lineup.id
                    ? 'bg-gradient-to-r from-ice-500 to-ice-600 text-white shadow-glow-blue'
                    : 'bg-white/5 text-ice-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {lineup.name}
              </button>
            ))}
            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-ice-400 hover:text-white bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/30 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {selectedLineupId && (
            <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-goal-400 hover:text-goal-300 hover:bg-goal-500/10 rounded-lg transition-all shrink-0" title="Delete lineup">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* No lineups */}
      {lineups.length === 0 && (
        <div className="glass-strong rounded-xl p-12 text-center border border-white/10">
          <div className="text-5xl mb-4">🏒</div>
          <p className="text-white text-xl font-bold mb-2">No lineups yet</p>
          <p className="text-ice-300 mb-6">Create your first lineup to start building line combinations</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowNewModal(true)} className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue">
            <Plus className="w-4 h-4 inline mr-2" />Create First Lineup
          </motion.button>
        </div>
      )}

      {/* Lineup editor */}
      {selectedLineup && (
        <>
          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? `bg-gradient-to-r ${TAB_COLORS[tab.key]} text-white shadow-lg` 
                    : 'text-ice-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Line cards */}
          <div className="space-y-4">
            {LINE_CONFIG[activeTab].map((lineConfig, index) => (
              <motion.div
                key={lineConfig.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-xl p-5 border ${LINE_COLORS[lineConfig.key] || 'border-white/10 bg-white/3'}`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-bold text-white">{lineConfig.label}</span>
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-ice-400">
                    {lineConfig.positions.filter(p => localSlots[lineConfig.key]?.[p.key]).length}/{lineConfig.positions.length} filled
                  </span>
                </div>

                <div className={`grid gap-4 ${
                  lineConfig.positions.length === 2 ? 'grid-cols-2' :
                  lineConfig.positions.length === 3 ? 'grid-cols-3' :
                  lineConfig.positions.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
                  'grid-cols-2 sm:grid-cols-5'
                }`}>
                  {lineConfig.positions.map(posConfig => {
                    const currentPlayerId = localSlots[lineConfig.key]?.[posConfig.key] || ''
                    const currentPlayer = players.find(p => p.id === currentPlayerId)
                    const availablePlayers = getPlayersForPosition(players, posConfig.key)
                    const isInjured = currentPlayer?.status === 'injured'

                    return (
                      <div key={posConfig.key} className="space-y-1.5">
                        <label className="block text-xs font-bold text-ice-400 uppercase tracking-wider">{posConfig.label}</label>
                        <div className="relative">
                          <select
                            value={currentPlayerId}
                            onChange={e => handleSlotChange(lineConfig.key, posConfig.key, e.target.value)}
                            className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-sm font-semibold focus:ring-2 focus:ring-ice-500/50 transition-all outline-none cursor-pointer appearance-none
                              ${isInjured ? 'border-goal-500/50 text-goal-300 bg-goal-500/10' : currentPlayerId ? 'border-ice-500/40 text-white' : 'border-white/10 text-ice-500 hover:border-white/20'}
                            `}
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="" style={{ backgroundColor: '#1e3a5f' }}>— Empty —</option>
                            {availablePlayers.map(p => (
                              <option key={p.id} value={p.id} disabled={p.status === 'injured'} style={{ backgroundColor: '#1e3a5f', color: 'white' }}>
                                #{p.jerseyNumber} {p.firstName} {p.lastName}{p.status === 'injured' ? ' 🚑' : p.status === 'inactive' ? ' ○' : ''}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ice-500 pointer-events-none" />
                        </div>
                        {isInjured && (
                          <p className="text-xs text-goal-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Injured
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* New Lineup Modal */}
      <AnimatePresence>
        {showNewModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNewModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="glass-strong rounded-xl w-full max-w-sm border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-lg font-bold text-white">New Lineup</h3>
                  <button onClick={() => setShowNewModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-5 py-4">
                  <label className="block text-xs font-bold text-ice-300 uppercase tracking-wider mb-2">Lineup Name</label>
                  <input
                    autoFocus
                    value={newLineupName}
                    onChange={e => setNewLineupName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateLineup()}
                    placeholder="e.g. Game Day Lines"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
                  <button onClick={() => setShowNewModal(false)} className="px-4 py-2 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: !newLineupName.trim() ? 1 : 1.03 }} whileTap={{ scale: !newLineupName.trim() ? 1 : 0.97 }} onClick={handleCreateLineup} disabled={!newLineupName.trim() || creating} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-50 flex items-center gap-2">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? 'Creating...' : 'Create'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="glass-strong rounded-xl w-full max-w-sm border border-goal-500/30 shadow-2xl overflow-hidden">
                <div className="px-5 py-4 bg-goal-500/10 border-b border-goal-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-goal-400" />
                    <h3 className="text-lg font-bold text-white">Delete Lineup?</h3>
                  </div>
                  <p className="text-sm text-goal-200">"{selectedLineup?.name}" will be permanently deleted.</p>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                  <button onClick={handleDeleteLineup} disabled={deleting} className="px-5 py-2 text-sm font-bold bg-goal-600 hover:bg-goal-500 text-white rounded-lg transition-all disabled:opacity-60 flex items-center gap-2">
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
