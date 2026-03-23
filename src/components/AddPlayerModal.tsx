import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { createPlayer, CreatePlayerInput } from '../api/api'

interface AddPlayerModalProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
  onPlayerAdded: () => void
}

const POSITIONS = [
  { value: 'center', label: 'Center' },
  { value: 'left_wing', label: 'Left Wing' },
  { value: 'right_wing', label: 'Right Wing' },
  { value: 'left_defense', label: 'Left Defense' },
  { value: 'right_defense', label: 'Right Defense' },
  { value: 'goalie', label: 'Goalie' },
]

const emptyForm: CreatePlayerInput = {
  firstName: '',
  lastName: '',
  jerseyNumber: 0,
  position: 'center',
  shoots: 'left',
  height: undefined,
  weight: undefined,
  birthDate: '',
  status: 'active',
  injuryNote: '',
}

export default function AddPlayerModal({ teamId, isOpen, onClose, onPlayerAdded }: AddPlayerModalProps) {
  const [form, setForm] = useState<CreatePlayerInput>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'jerseyNumber' || name === 'height' || name === 'weight'
        ? value === '' ? undefined : Number(value)
        : value
    }))
  }

  const handleSubmit = async () => {
    setError(null)

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.')
      return
    }
    if (!form.jerseyNumber || form.jerseyNumber < 1 || form.jerseyNumber > 99) {
      setError('Jersey number must be between 1 and 99.')
      return
    }

    try {
      setLoading(true)
      await createPlayer(teamId, form)
      setForm(emptyForm)
      onPlayerAdded()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add player.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setForm(emptyForm)
    setError(null)
    onClose()
  }

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none"
  const selectClass = `${inputClass} cursor-pointer` 
  const labelClass = "block text-xs font-bold text-ice-300 uppercase tracking-wider mb-1.5"

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="glass-strong rounded-xl w-full max-w-lg shadow-2xl border border-white/10 overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center shadow-glow-blue">
                    <UserPlus className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">Add New Player</h2>
                </div>
                <button onClick={handleClose} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Connor" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="McDavid" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                {/* Jersey + Position row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Jersey # *</label>
                    <input name="jerseyNumber" type="number" min={1} max={99} value={form.jerseyNumber || ''} onChange={handleChange} placeholder="97" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className={labelClass}>Position *</label>
                    <select name="position" value={form.position} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                      {POSITIONS.map(p => (
                        <option key={p.value} value={p.value} style={{ backgroundColor: '#1e3a5f' }}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Shoots + Status row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Shoots</label>
                    <select name="shoots" value={form.shoots} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                      <option value="left" style={{ backgroundColor: '#1e3a5f' }}>Left</option>
                      <option value="right" style={{ backgroundColor: '#1e3a5f' }}>Right</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select name="status" value={form.status} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                      <option value="active" style={{ backgroundColor: '#1e3a5f' }}>Active</option>
                      <option value="inactive" style={{ backgroundColor: '#1e3a5f' }}>Inactive</option>
                      <option value="injured" style={{ backgroundColor: '#1e3a5f' }}>Injured</option>
                    </select>
                  </div>
                </div>

                {/* Height + Weight row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Height (cm)</label>
                    <input name="height" type="number" value={form.height ?? ''} onChange={handleChange} placeholder="185" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className={labelClass}>Weight (kg)</label>
                    <input name="weight" type="number" value={form.weight ?? ''} onChange={handleChange} placeholder="88" className={inputClass} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>

                {/* Birth Date */}
                <div>
                  <label className={labelClass}>Birth Date</label>
                  <input name="birthDate" type="date" value={form.birthDate ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} />
                </div>

                {/* Injury note — only if injured */}
                {form.status === 'injured' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className={labelClass}>Injury Note</label>
                    <textarea name="injuryNote" value={form.injuryNote ?? ''} onChange={handleChange} placeholder="Lower body injury, out 2-3 weeks..." rows={2} className={`${inputClass} resize-none`} style={{ colorScheme: 'dark' }} />
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm font-medium">
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5">
                <button onClick={handleClose} disabled={loading} className="px-5 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.03 }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Add Player</>
                  )}
                </motion.button>
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
