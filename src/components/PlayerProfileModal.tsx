import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, User, Pencil, Trash2, Save, Loader2, AlertTriangle,
  TrendingUp, TrendingDown, Minus, Sparkles, BarChart2,
  ChevronRight, Activity, Target
} from 'lucide-react'
import {
  Player, updatePlayer, deletePlayer,
  fetchPlayerDevelopment, generatePlayerAiReport,
  PlayerDevelopmentData, PlayerAiReport
} from '../api/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PlayerProfileModalProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onPlayerUpdated: () => void
  onPlayerDeleted: () => void
}

type Tab = 'profile' | 'development' | 'ai'

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

const RATING_CONFIG: Record<string, { color: string; bg: string }> = {
  'Elite': { color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/30' },
  'Above Average': { color: 'text-green-300', bg: 'bg-green-500/20 border-green-500/30' },
  'Average': { color: 'text-ice-300', bg: 'bg-ice-500/20 border-ice-500/30' },
  'Developing': { color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/30' },
  'Needs Improvement': { color: 'text-goal-300', bg: 'bg-goal-500/20 border-goal-500/30' },
}

const LINE_TYPE_LABELS: Record<string, string> = {
  forward_1: 'Line 1', forward_2: 'Line 2', forward_3: 'Line 3', forward_4: 'Line 4',
  defense_1: 'Pair 1', defense_2: 'Pair 2', defense_3: 'Pair 3',
  pp1: 'PP1', pp2: 'PP2', pk1: 'PK1', pk2: 'PK2',
  goalies: 'Goalies',
}

export default function PlayerProfileModal({ player, isOpen, onClose, onPlayerUpdated, onPlayerDeleted }: PlayerProfileModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<Partial<Player>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Development data
  const [devData, setDevData] = useState<PlayerDevelopmentData | null>(null)
  const [devLoading, setDevLoading] = useState(false)

  // AI report
  const [aiReport, setAiReport] = useState<PlayerAiReport | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    if (player) {
      setForm({ ...player })
      setIsEditing(false)
      setError(null)
      setShowDeleteConfirm(false)
      setActiveTab('profile')
      setDevData(null)
      setAiReport(null)
      setAiError(null)
    }
  }, [player])

  useEffect(() => {
    if (activeTab === 'development' && player && !devData && !devLoading) {
      loadDevData()
    }
  }, [activeTab, player])

  const loadDevData = async () => {
    if (!player) return
    try {
      setDevLoading(true)
      const data = await fetchPlayerDevelopment(player.id)
      setDevData(data)
    } catch (err) {
      console.error('Error loading dev data:', err)
    } finally {
      setDevLoading(false)
    }
  }

  const handleGenerateAiReport = async () => {
    if (!player || !devData) return
    setAiLoading(true)
    setAiError(null)
    try {
      const report = await generatePlayerAiReport(
        player.id, player, devData.totals, devData.gameStats, devData.lineAssignment
      )
      setAiReport(report)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate report.')
    } finally {
      setAiLoading(false)
    }
  }

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
    if (!form.firstName?.trim() || !form.lastName?.trim()) { setError('First and last name are required.'); return }
    if (!form.jerseyNumber || form.jerseyNumber < 1 || form.jerseyNumber > 99) { setError('Jersey number must be between 1 and 99.'); return }
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
    setIsEditing(false); setError(null); setShowDeleteConfirm(false)
    onClose()
  }

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"
  const selectClass = `${inputClass} cursor-pointer` 
  const labelClass = "block text-xs font-bold text-ice-300 uppercase tracking-wider mb-1.5"

  const statusColors: Record<string, string> = {
    active: 'status-active',
    injured: 'status-injured',
    inactive: 'status-day-to-day',
  }

  if (!player) return null

  const chartData = devData?.gameStats.map((g, i) => ({
    game: `G${i + 1}`,
    opponent: g.opponent,
    points: g.points,
    goals: g.goals,
    assists: g.assists,
    shots: g.shots,
  })) ?? []

  const trendIcon = aiReport?.trend === 'improving'
    ? <TrendingUp className="w-4 h-4 text-green-400" />
    : aiReport?.trend === 'declining'
    ? <TrendingDown className="w-4 h-4 text-goal-400" />
    : <Minus className="w-4 h-4 text-ice-400" />

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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center shadow-glow-blue text-white font-black text-lg">
                    {player.jerseyNumber}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">{player.firstName} {player.lastName}</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-ice-400">{POSITION_LABELS[player.position] ?? player.position}</span>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${statusColors[player.status] ?? 'status-day-to-day'}`}>
                        {player.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={handleClose} disabled={loading} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-white/3 shrink-0">
                {[
                  { key: 'profile' as Tab, label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
                  { key: 'development' as Tab, label: 'Development', icon: <Activity className="w-3.5 h-3.5" /> },
                  { key: 'ai' as Tab, label: 'AI Report', icon: <Sparkles className="w-3.5 h-3.5" /> },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? tab.key === 'ai' ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg' : 'bg-white/10 text-white'
                        : 'text-ice-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                  <>
                    {!isEditing ? (
                      <>
                        {player.injuryNote && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-goal-500/10 border border-goal-500/20 text-goal-300 text-xs">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            {player.injuryNote}
                          </div>
                        )}
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
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelClass}>First Name *</label><input name="firstName" value={form.firstName ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                          <div><label className={labelClass}>Last Name *</label><input name="lastName" value={form.lastName ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className={labelClass}>Jersey # *</label><input name="jerseyNumber" type="number" min={1} max={99} value={form.jerseyNumber ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                          <div>
                            <label className={labelClass}>Position *</label>
                            <select name="position" value={form.position ?? 'center'} onChange={handleChange} className={selectClass} style={{ colorScheme: 'dark' }}>
                              {POSITIONS.map(p => <option key={p.value} value={p.value} style={{ backgroundColor: '#1e3a5f' }}>{p.label}</option>)}
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
                          <div><label className={labelClass}>Height (cm)</label><input name="height" type="number" value={form.height ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                          <div><label className={labelClass}>Weight (kg)</label><input name="weight" type="number" value={form.weight ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                        </div>
                        <div><label className={labelClass}>Birth Date</label><input name="birthDate" type="date" value={form.birthDate ?? ''} onChange={handleChange} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                        {form.status === 'injured' && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <label className={labelClass}>Injury Note</label>
                            <textarea name="injuryNote" value={form.injuryNote ?? ''} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} style={{ colorScheme: 'dark' }} />
                          </motion.div>
                        )}
                        {error && <div className="px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">{error}</div>}
                      </>
                    )}

                    <AnimatePresence>
                      {showDeleteConfirm && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-lg border border-goal-500/40 bg-goal-500/10 p-4">
                          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-goal-400" /><p className="text-sm font-bold text-goal-300">Delete {player.firstName} {player.lastName}?</p></div>
                          <p className="text-xs text-goal-200 mb-4">This cannot be undone.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 text-xs font-semibold text-ice-300 bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                            <button onClick={handleDelete} disabled={loading} className="flex-1 px-3 py-2 text-xs font-bold text-white bg-goal-600 hover:bg-goal-500 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1">
                              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              {loading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}

                {/* ── DEVELOPMENT TAB ── */}
                {activeTab === 'development' && (
                  <>
                    {devLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-ice-400" />
                      </div>
                    ) : !devData ? (
                      <div className="text-center py-12">
                        <p className="text-ice-400">Failed to load development data</p>
                      </div>
                    ) : (
                      <>
                        {/* Season totals */}
                        <div>
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-3">Season Totals — {devData.totals.gamesPlayed} GP</p>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { label: 'Goals', value: devData.totals.goals, color: 'text-goal-300' },
                              { label: 'Assists', value: devData.totals.assists, color: 'text-ice-300' },
                              { label: 'Points', value: devData.totals.points, color: 'text-white', big: true },
                              { label: 'Shots', value: devData.totals.shots, color: 'text-ice-300' },
                              { label: 'Blocks', value: devData.totals.blocks, color: 'text-purple-300' },
                              { label: 'PIMs', value: devData.totals.pims, color: 'text-yellow-300' },
                            ].map(s => (
                              <div key={s.label} className={`bg-white/5 rounded-xl p-3 border border-white/5 text-center ${s.big ? 'bg-ice-500/10 border-ice-500/20' : ''}`}>
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-xs text-ice-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Points per game */}
                        {devData.totals.gamesPlayed > 0 && (
                          <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <div>
                              <p className="text-xs text-ice-400 uppercase tracking-wider">Points / Game</p>
                              <p className="text-2xl font-black text-white mt-0.5">
                                {(devData.totals.points / devData.totals.gamesPlayed).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-ice-400 uppercase tracking-wider">Shot % </p>
                              <p className="text-2xl font-black text-white mt-0.5">
                                {devData.totals.shots > 0 ? ((devData.totals.goals / devData.totals.shots) * 100).toFixed(1) : '0.0'}%
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Current line */}
                        {devData.lineAssignment && (
                          <div className="bg-ice-500/10 border border-ice-500/20 rounded-xl p-4">
                            <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Current Line Assignment</p>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center shadow-glow-blue">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{LINE_TYPE_LABELS[devData.lineAssignment.lineType] ?? devData.lineAssignment.lineType}</p>
                                <p className="text-xs text-ice-400">{devData.lineAssignment.position.toUpperCase()} · {devData.lineAssignment.lineupName}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Points chart */}
                        {chartData.length > 0 ? (
                          <div>
                            <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-3">Points by Game</p>
                            <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                              <ResponsiveContainer width="100%" height={140}>
                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                  <XAxis dataKey="game" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                  <Tooltip
                                    contentStyle={{ background: '#0f2744', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
                                    labelFormatter={(_, payload) => payload?.[0]?.payload?.opponent ? `vs ${payload[0].payload.opponent}` : ''}
                                    formatter={(value, name) => [value, name === 'goals' ? 'Goals' : name === 'assists' ? 'Assists' : 'Points']}
                                  />
                                  <Bar dataKey="goals" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                                  <Bar dataKey="assists" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                              <div className="flex items-center gap-4 mt-2 justify-center">
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-ice-400">Goals</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-xs text-ice-400">Assists</span></div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white/3 rounded-xl border border-white/5">
                            <BarChart2 className="w-10 h-10 text-ice-500 mx-auto mb-3" />
                            <p className="text-ice-400 font-semibold text-sm">No game stats yet</p>
                            <p className="text-ice-500 text-xs mt-1">Record game stats to see trends</p>
                          </div>
                        )}

                        {/* AI report CTA */}
                        <button
                          onClick={() => setActiveTab('ai')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-all"
                        >
                          <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white">Generate AI Development Report</p>
                            <p className="text-xs text-ice-400">Claude analyzes their stats and builds a personalized plan</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-ice-500 ml-auto shrink-0" />
                        </button>
                      </>
                    )}
                  </>
                )}

                {/* ── AI REPORT TAB ── */}
                {activeTab === 'ai' && (
                  <>
                    {!aiReport && !aiLoading && (
                      <div className="space-y-5">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                          <p className="text-white font-semibold mb-1">AI Player Development Report</p>
                          <p className="text-ice-300 text-sm leading-relaxed">
                            Claude will analyze <strong className="text-white">{player.firstName}'s</strong> season stats, performance trend, and current line assignment to generate a personalized development report with strengths, areas to improve, and recommended drills.
                          </p>
                        </div>

                        {aiError && (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />{aiError}
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            if (!devData) {
                              setDevLoading(true)
                              const data = await fetchPlayerDevelopment(player.id)
                              setDevData(data)
                              setDevLoading(false)
                            }
                            handleGenerateAiReport()
                          }}
                          className="w-full py-3 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> Generate Development Report
                        </motion.button>
                      </div>
                    )}

                    {aiLoading && (
                      <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                          <Sparkles className="w-7 h-7 text-white animate-pulse" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold">Analyzing {player.firstName}'s season...</p>
                          <p className="text-ice-400 text-sm mt-1">Claude is reviewing stats and trends</p>
                        </div>
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                      </div>
                    )}

                    {aiReport && !aiLoading && (
                      <div className="space-y-4">
                        {/* Rating + trend */}
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-xl text-sm font-black border ${RATING_CONFIG[aiReport.overallRating]?.bg ?? 'bg-white/10 border-white/10'} ${RATING_CONFIG[aiReport.overallRating]?.color ?? 'text-ice-300'}`}>
                            {aiReport.overallRating}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                            {trendIcon}
                            <span className="text-xs font-bold text-ice-300 capitalize">{aiReport.trend}</span>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                          <p className="text-white text-sm leading-relaxed">{aiReport.summary}</p>
                        </div>

                        {/* Trend analysis */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Performance Trend</p>
                          <p className="text-sm text-ice-200 leading-relaxed">{aiReport.trendAnalysis}</p>
                        </div>

                        {/* Strengths */}
                        <div>
                          <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2">Strengths</p>
                          <div className="space-y-1.5">
                            {aiReport.strengths.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-ice-200">
                                <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Areas to improve */}
                        <div>
                          <p className="text-xs font-bold text-goal-400 uppercase tracking-wider mb-2">Areas to Improve</p>
                          <div className="space-y-1.5">
                            {aiReport.areasToImprove.map((a, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-ice-200">
                                <ChevronRight className="w-3.5 h-3.5 text-goal-400 mt-0.5 shrink-0" />{a}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recommended drills */}
                        <div>
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Recommended Drills</p>
                          <div className="space-y-2">
                            {aiReport.recommendedDrills.map((d, i) => (
                              <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-sm font-bold text-white">{d.name}</p>
                                <p className="text-xs text-ice-400 mt-0.5">{d.reason}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Line recommendation */}
                        <div className="bg-ice-500/10 border border-ice-500/20 rounded-xl p-4">
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Line Deployment Recommendation</p>
                          <p className="text-sm text-white leading-relaxed">{aiReport.lineRecommendation}</p>
                        </div>

                        {/* Coaching tips */}
                        <div>
                          <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Coaching Tips</p>
                          <div className="space-y-1.5">
                            {aiReport.coachingTips.map((t, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-ice-200">
                                <span className="text-ice-500 shrink-0">•</span>{t}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Regenerate */}
                        <button
                          onClick={() => { setAiReport(null); setAiError(null) }}
                          className="w-full py-2 text-xs font-semibold text-ice-400 hover:text-ice-200 bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/5 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Regenerate Report
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                {activeTab === 'profile' && (
                  <>
                    <button
                      onClick={() => { setShowDeleteConfirm(true); setIsEditing(false) }}
                      disabled={loading || showDeleteConfirm}
                      className="p-2.5 text-goal-400 hover:text-goal-300 hover:bg-goal-500/10 rounded-lg transition-all disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <button onClick={() => { setIsEditing(false); setForm({ ...player }); setError(null) }} disabled={loading} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                            Cancel
                          </button>
                          <motion.button whileHover={{ scale: loading ? 1 : 1.03 }} whileTap={{ scale: loading ? 1 : 0.97 }} onClick={handleSave} disabled={loading} className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
                          </motion.button>
                        </>
                      ) : (
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { setIsEditing(true); setShowDeleteConfirm(false) }} className="px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all flex items-center gap-2">
                          <Pencil className="w-4 h-4" /> Edit Player
                        </motion.button>
                      )}
                    </div>
                  </>
                )}
                {activeTab === 'development' && (
                  <button onClick={() => setActiveTab('ai')} className="ml-auto px-5 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg transition-all flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> AI Report
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
