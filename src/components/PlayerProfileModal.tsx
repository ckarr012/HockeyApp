import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Pencil, Trash2, Save, Loader2, AlertTriangle } from 'lucide-react'
import { Player, updatePlayer, deletePlayer } from '../api/api'

interface PlayerProfileModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onPlayerUpdated: () => void
  onPlayerDeleted: () => void
}

const POSITIONS = [
  { value: 'center', label: 'Center' },
  { value: 'left_wing', label: 'Left Wing' },
  { value: 'right_wing', label: 'Right Wing' },
  { value: 'left_defense', label: 'Left Defense' },
  { value: 'right_defense', label: 'Right Defense' },
  { value: 'goalie', label: 'Goalie' },
]

const POSITION_LABELS: Record<string, string> = {
  center: 'Center', left_wing: 'Left Wing', right_wing: 'Right Wing',
  left_defense: 'Left Defense', right_defense: 'Right Defense', goalie: 'Goalie',
}

export default function PlayerProfileModal({ player, isOpen, onClose, onPlayerUpdated, onPlayerDeleted }: PlayerProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<Player>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (player) {
      setForm({ ...player })
      setIsEditing(false)
      setError(null)
      setShowDeleteConfirm(false)
    }
  }, [player])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'jerseyNumber' || name === 'height' || name === 'weight'
        ? value === '' ? undefined : Number(value)
        : value
    }))
  }

  const handleSave = async () => {
    if (!player) return
    setError(null)
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      setError('First and last name are required.')
      return
    }
    if (!form.jerseyNumber || form.jerseyNumber < 1 || form.jerseyNumber > 99) {
      setError('Jersey number must be between 1 and 99.')
      return
    }
    try {
      setLoading(true)
      await updatePlayer(player.id, form)
      onPlayerUpdated()
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!player) return
    try {
      setLoading(true)
      await deletePlayer(player.id)
      onPlayerDeleted()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete player.')
      setShowDeleteConfirm(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setIsEditing(false)
    setError(null)
    setShowDeleteConfirm(false)
    onClose()
  }

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none"
  const selectClass = `${inputClass} cursor-pointer` 
  const labelClass = "block text-xs font-bold text-ice-300 uppercase tracking-wider mb-1.5"

  const statusColors: Record<string, string> = {
    active: 'status-active',
    injured: 'status-injured',
    inactive: 'status-day-to-day',
  }

  if (!player) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-md flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="glass-strong h-full flex flex-col border-l border-white/10 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center shadow-glow-blue">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {player.firstName} {player.lastName}
                    </h2>
                    <p className="text-xs text-ice-300">#{player.jerseyNumber} · {POSITION_LABELS[player.position] ?? player.position}</p>
                  </div>
                </div>
                <button onClick={handleClose} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {!isEditing ? (
                  // ── READ MODE ──
                  <>
                    {/* Status badge */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${statusColors[player.status] ?? 'status-day-to-day'}`}>
                        {player.status.charAt(0).toUpperCase() + player.status.slice(1)}
                      </span>
                      {player.injuryNote && (
                        <span className="text-xs text-goal-300 italic">{player.injuryNote}</span>
                      )}
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Position', value: POSITION_LABELS[player.position] ?? player.position },
                        { label: 'Shoots', value: player.shoots ? player.shoots.charAt(0).toUpperCase() + player.shoots.slice(1) : '—' },
                        { label: 'Height', value: player.height ? `${player.height} cm` : '—' },
                        { label: 'Weight', value: player.weight ? `${player.weight} kg` : '—' },
                        { label: 'Birth Date', value: player.birthDate ? new Date(player.birthDate).toLocaleDateString() : '—' },
                        { label: 'Jersey #', value: `#${player.jerseyNumber}` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/5 rounded-lg px-4 py-3 border border-white/5">
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-1">{label}</p>
                          <p className="text-sm font-semibold text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  // ── EDIT MODE ──
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>First Name *</label>
                        <input name="firstName" value={form.firstName ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                      </div>
                      <div>
                        <label className={labelClass}>Last Name *</label>
                        <input name="lastName" value={form.lastName ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Jersey # *</label>
                        <input name="jerseyNumber" type="number" min={1} max={99} value={form.jerseyNumber ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                      </div>
                      <div>
                        <label className={labelClass}>Position *</label>
                        <select name="position" value={form.position ?? 'center'} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                          {POSITIONS.map(p => (
                            <option key={p.value} value={p.value} style={{ backgroundColor: '#1e3a5f' }}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Shoots</label>
                        <select name="shoots" value={form.shoots ?? 'left'} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                          <option value="left" style={{ backgroundColor: '#1e3a5f' }}>Left</option>
                          <option value="right" style={{ backgroundColor: '#1e3a5f' }}>Right</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Status</label>
                        <select name="status" value={form.status ?? 'active'} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                          <option value="active" style={{ backgroundColor: '#1e3a5f' }}>Active</option>
                          <option value="inactive" style={{ backgroundColor: '#1e3a5f' }}>Inactive</option>
                          <option value="injured" style={{ backgroundColor: '#1e3a5f' }}>Injured</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Height (cm)</label>
                        <input name="height" type="number" value={form.height ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                      </div>
                      <div>
                        <label className={labelClass}>Weight (kg)</label>
                        <input name="weight" type="number" value={form.weight ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Birth Date</label>
                      <input name="birthDate" type="date" value={form.birthDate ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                    </div>

                    {form.status === 'injured' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <label className={labelClass}>Injury Note</label>
                        <textarea name="injuryNote" value={form.injuryNote ?? ''} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} style={{ colorScheme: 'dark' }} />
                      </motion.div>
                    )}

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm font-medium">
                        {error}
                      </motion.div>
                    )}
                  </>
                )}

                {/* Delete confirm */}
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-lg border border-goal-500/40 bg-goal-500/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-goal-400" />
                        <p className="text-sm font-bold text-goal-300">Delete {player.firstName} {player.lastName}?</p>
                      </div>
                      <p className="text-xs text-goal-200 mb-4">This cannot be undone. All data for this player will be permanently removed.</p>
                      <div className="flex gap-2">
                        <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 text-xs font-semibold text-ice-300 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                          Cancel
                        </button>
                        <button onClick={handleDelete} disabled={loading} className="flex-1 px-3 py-2 text-xs font-bold text-white bg-goal-600 hover:bg-goal-500 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1">
                          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          {loading ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                <button
                  onClick={() => { setShowDeleteConfirm(true); setIsEditing(false) }}
                  disabled={loading || showDeleteConfirm}
                  className="p-2.5 text-goal-400 hover:text-goal-300 hover:bg-goal-500/10 rounded-lg transition-all disabled:opacity-40"
                  title="Delete player"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button onClick={() => { setIsEditing(false); setForm({ ...player }); setError(null) }} disabled={loading} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        Cancel
                      </button>
                      <motion.button
                        whileHover={{ scale: loading ? 1 : 1.03 }}
                        whileTap={{ scale: loading ? 1 : 0.97 }}
                        onClick={handleSave}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2"
                      >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setIsEditing(true); setShowDeleteConfirm(false) }}
                      className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all flex items-center gap-2"
                    >
                      <Pencil className="w-4 h-4" /> Edit Player
                    </motion.button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
