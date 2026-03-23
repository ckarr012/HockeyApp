import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Loader2, CheckCircle, ImagePlus } from 'lucide-react'
import { fetchPlayers, recordGameStats, Player } from '../api/api'
import StatImportModal from './StatImportModal'

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
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => { loadPlayers() }, [teamId])

  const loadPlayers = async () => {
    try {
      setLoading(true)
      const playersData = await fetchPlayers(teamId)
      setPlayers(playersData)
      const initialStats: Record<string, PlayerStatInput> = {}
      playersData.forEach(p => {
        initialStats[p.id] = { playerId: p.id, goals: 0, assists: 0, shots: 0, blocks: 0, pims: 0 }
      })
      setStats(initialStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  const updateStat = (playerId: string, field: keyof Omit<PlayerStatInput, 'playerId'>, value: string) => {
    setStats(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: Math.max(0, parseInt(value) || 0) }
    }))
  }

  const handleImportComplete = (imported: Array<{ playerName: string; goals: number; assists: number; shots: number; blocks: number; pims: number }>) => {
    setStats(prev => {
      const updated = { ...prev }
      imported.forEach(importedStat => {
        const match = players.find(p => {
          const full = `${p.firstName} ${p.lastName}`.toLowerCase()
          const importedLower = importedStat.playerName.toLowerCase()
          return full === importedLower ||
            full.includes(importedLower) ||
            importedLower.includes(p.lastName.toLowerCase())
        })
        if (match) {
          updated[match.id] = {
            playerId: match.id,
            goals: importedStat.goals,
            assists: importedStat.assists,
            shots: importedStat.shots,
            blocks: importedStat.blocks,
            pims: importedStat.pims,
          }
        }
      })
      return updated
    })
    setShowImport(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      const statsArray = Object.values(stats).filter(s =>
        s.goals > 0 || s.assists > 0 || s.shots > 0 || s.blocks > 0 || s.pims > 0
      )
      await recordGameStats(gameId, statsArray)
      setSaved(true)
      setTimeout(() => { onSuccess(); onClose() }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stats')
      setSaving(false)
    }
  }

  const inputClass = "w-full px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none"
  const headerClass = "text-center text-xs font-bold text-ice-400 uppercase tracking-wider"

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-strong rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
            <div>
              <h2 className="text-xl font-bold text-white">Record Box Score</h2>
              <p className="text-sm text-ice-300 mt-0.5">{gameName}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowImport(true)}
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
              >
                <ImagePlus className="w-4 h-4" /> Import from Photo
              </motion.button>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-ice-400" />
              </div>
            ) : saved ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </motion.div>
                <p className="text-white text-xl font-bold">Stats Saved!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Column headers */}
                <div className="grid grid-cols-8 gap-2 pb-2 border-b border-white/10 sticky top-0 bg-transparent">
                  <div className="col-span-2" />
                  {['Goals', 'Assists', 'Shots', 'Blocks', 'PIMs'].map(h => (
                    <div key={h} className={headerClass}>{h}</div>
                  ))}
                  <div />
                </div>

                {/* Player rows */}
                {players.map((player, i) => {
                  const s = stats[player.id]
                  const hasStats = s && (s.goals > 0 || s.assists > 0 || s.shots > 0 || s.blocks > 0 || s.pims > 0)
                  return (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`grid grid-cols-8 gap-2 items-center py-2.5 px-2 rounded-lg transition-all ${hasStats ? 'bg-ice-500/10 border border-ice-500/20' : 'hover:bg-white/3'}`}
                    >
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {player.jerseyNumber}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{player.firstName} {player.lastName}</p>
                          <p className="text-xs text-ice-400 capitalize">{player.position.replace('_', ' ')}</p>
                        </div>
                      </div>
                      {(['goals', 'assists', 'shots', 'blocks', 'pims'] as const).map(field => (
                        <input
                          key={field}
                          type="number"
                          min={0}
                          value={s?.[field] || 0}
                          onChange={e => updateStat(player.id, field, e.target.value)}
                          className={inputClass}
                          style={{ colorScheme: 'dark' }}
                        />
                      ))}
                      <div />
                    </motion.div>
                  )
                })}
              </div>
            )}

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          {!saved && (
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
              <button onClick={onClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: saving ? 1 : 1.03 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                onClick={handleSave}
                disabled={saving || loading}
                className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Box Score'}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* AI Import Modal */}
      <AnimatePresence>
        {showImport && (
          <StatImportModal
            players={players}
            onClose={() => setShowImport(false)}
            onImportComplete={handleImportComplete}
          />
        )}
      </AnimatePresence>
    </>
  )
}
