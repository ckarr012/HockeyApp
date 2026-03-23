import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Plus, Edit2, Eye, Target, TrendingUp, TrendingDown,
  X, Save, Loader2, Sparkles, Printer, ChevronRight, User, AlertTriangle
} from 'lucide-react'
import {
  fetchGames, fetchPlayers, fetchScoutingReports,
  createScoutingReport, updateScoutingReport, generateAiScoutingReport,
  Game, ScoutingReport, KeyPlayer, Player
} from '../api/api'
import { format, parseISO } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'

interface ScoutingHubProps {
  teamId: string
}

type ModalMode = 'view' | 'edit' | 'create' | 'ai'

const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"
const textareaClass = `${inputClass} resize-none`
const labelClass = "block text-xs font-bold text-ice-400 uppercase tracking-wider mb-2"

const emptyKeyPlayers = (): KeyPlayer[] => [
  { name: '', number: 0, position: '', notes: '' },
  { name: '', number: 0, position: '', notes: '' },
  { name: '', number: 0, position: '', notes: '' },
]

export default function ScoutingHub({ teamId }: ScoutingHubProps) {
  const [games, setGames] = useState<Game[]>([])
  const [reports, setReports] = useState<ScoutingReport[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal state
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [showModal, setShowModal] = useState(false)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [selectedReport, setSelectedReport] = useState<ScoutingReport | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [tacticalNotes, setTacticalNotes] = useState('')
  const [powerPlayTendency, setPowerPlayTendency] = useState('')
  const [goalieWeakness, setGoalieWeakness] = useState('')
  const [keyPlayers, setKeyPlayers] = useState<KeyPlayer[]>(emptyKeyPlayers())

  // AI state
  const [aiNotes, setAiNotes] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Print ref
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadData() }, [teamId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [gamesData, reportsData, playersData] = await Promise.all([
        fetchGames(teamId),
        fetchScoutingReports(teamId),
        fetchPlayers(teamId),
      ])
      setGames(gamesData)
      setReports(reportsData)
      setPlayers(playersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getReportForGame = (gameId: string) => reports.find(r => r.gameId === gameId) ?? null

  const loadReportIntoForm = (report: ScoutingReport) => {
    setStrengths(report.strengths ?? '')
    setWeaknesses(report.weaknesses ?? '')
    setTacticalNotes(report.tacticalNotes ?? '')
    setPowerPlayTendency(report.powerPlayTendency ?? '')
    setGoalieWeakness(report.goalieWeakness ?? '')
    if (report.keyPlayersJson) {
      try {
        const parsed = JSON.parse(report.keyPlayersJson)
        const padded = [...parsed, ...emptyKeyPlayers()].slice(0, 3)
        setKeyPlayers(padded)
      } catch { setKeyPlayers(emptyKeyPlayers()) }
    } else {
      setKeyPlayers(emptyKeyPlayers())
    }
  }

  const resetForm = () => {
    setStrengths(''); setWeaknesses(''); setTacticalNotes('')
    setPowerPlayTendency(''); setGoalieWeakness('')
    setKeyPlayers(emptyKeyPlayers())
    setAiNotes(''); setAiError(null)
  }

  const openView = async (game: Game) => {
    const report = getReportForGame(game.id)
    if (!report) return
    setSelectedGame(game)
    setSelectedReport(report)
    loadReportIntoForm(report)
    setModalMode('view')
    setShowModal(true)
  }

  const openCreate = (game: Game) => {
    setSelectedGame(game)
    setSelectedReport(null)
    resetForm()
    setModalMode('create')
    setShowModal(true)
  }

  const openEdit = (game: Game, report: ScoutingReport) => {
    setSelectedGame(game)
    setSelectedReport(report)
    loadReportIntoForm(report)
    setModalMode('edit')
    setShowModal(true)
  }

  const openAi = (game: Game) => {
    setSelectedGame(game)
    setSelectedReport(getReportForGame(game.id))
    resetForm()
    setModalMode('ai')
    setShowModal(true)
  }

  const handleGenerateAi = async () => {
    if (!selectedGame) return
    setAiError(null)
    setGeneratingAi(true)
    try {
      const result = await generateAiScoutingReport(selectedGame.opponent, aiNotes, players)
      setStrengths(result.strengths)
      setWeaknesses(result.weaknesses)
      setTacticalNotes(result.tacticalNotes + (result.lineMatchupSuggestions ? `\n\nLine Matchups: ${result.lineMatchupSuggestions}` : ''))
      setPowerPlayTendency(result.powerPlayTendency)
      setGoalieWeakness(result.goalieWeakness)
      const kp = result.keyPlayers?.slice(0, 3) ?? []
      const padded = [...kp, ...emptyKeyPlayers()].slice(0, 3)
      setKeyPlayers(padded)
      setModalMode(selectedReport ? 'edit' : 'create')
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate report.')
    } finally {
      setGeneratingAi(false)
    }
  }

  const handleSave = async () => {
    if (!selectedGame) return
    setSaving(true)
    try {
      const reportData = {
        game_id: selectedGame.id,
        opponent_name: selectedGame.opponent,
        date: selectedGame.gameDate,
        strengths,
        weaknesses,
        key_players: keyPlayers.filter(kp => kp.name.trim() !== ''),
        tactical_notes: tacticalNotes,
        power_play_tendency: powerPlayTendency,
        goalie_weakness: goalieWeakness,
      }
      if (selectedReport) {
        await updateScoutingReport(selectedReport.id, reportData)
      } else {
        await createScoutingReport(teamId, reportData)
      }
      await loadData()
      setShowModal(false)
    } catch (err) {
      console.error('Error saving:', err)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    if (!selectedGame) return
    const win = window.open('', '_blank')
    if (!win) return
    const kp = (() => {
      try { return selectedReport?.keyPlayersJson ? JSON.parse(selectedReport.keyPlayersJson) : [] } catch { return [] }
    })()
    win.document.write(`
      <!DOCTYPE html><html>
      <head><title>Scouting Report — vs ${selectedGame.opponent}</title>
      <style>
        body { font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 24px; color: #111; }
        h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
        h2 { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; margin: 20px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
        .meta { font-size: 13px; color: #555; margin-bottom: 24px; }
        .confidential { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; display: inline-block; margin-bottom: 16px; }
        p { font-size: 14px; line-height: 1.6; color: #374151; margin: 0; white-space: pre-line; }
        .kp-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .kp-table th { background: #f3f4f6; font-size: 12px; font-weight: 700; text-align: left; padding: 8px 12px; }
        .kp-table td { font-size: 13px; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="confidential">🔒 CONFIDENTIAL — Coaching Staff Only</div>
      <h1>Scouting Report</h1>
      <div class="meta">vs ${selectedGame.opponent} · ${format(parseISO(selectedGame.gameDate), 'MMM d, yyyy')} · ${selectedGame.homeAway === 'home' ? 'Home' : 'Away'}</div>
      ${kp.length > 0 ? `<h2>Key Players to Watch</h2><table class="kp-table"><thead><tr><th>#</th><th>Name</th><th>Position</th><th>Notes</th></tr></thead><tbody>${kp.map((p: KeyPlayer) => `<tr><td>${p.number}</td><td>${p.name}</td><td>${p.position}</td><td>${p.notes}</td></tr>`).join('')}</tbody></table>` : ''}
      ${strengths ? `<h2>Team Strengths</h2><p>${strengths}</p>` : ''}
      ${weaknesses ? `<h2>Weaknesses to Exploit</h2><p>${weaknesses}</p>` : ''}
      ${powerPlayTendency ? `<h2>Power Play Tendencies</h2><p>${powerPlayTendency}</p>` : ''}
      ${goalieWeakness ? `<h2>Goalie Weaknesses</h2><p>${goalieWeakness}</p>` : ''}
      ${tacticalNotes ? `<h2>Game Plan & Tactical Notes</h2><p>${tacticalNotes}</p>` : ''}
      </body></html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const updateKeyPlayer = (index: number, field: keyof KeyPlayer, value: string | number) => {
    const updated = [...keyPlayers]
    updated[index] = { ...updated[index], [field]: value }
    setKeyPlayers(updated)
  }

  if (loading) return <LoadingSpinner message="Loading scouting hub..." />

  if (error) return (
    <div className="p-8">
      <div className="glass-strong border border-goal-500/30 rounded-lg p-6 bg-goal-500/10">
        <p className="text-goal-300 font-semibold">{error}</p>
      </div>
    </div>
  )

  const scheduledGames = games.filter(g => g.status === 'scheduled')
  const completedGamesWithReports = games.filter(g => g.status === 'completed' && getReportForGame(g.id))

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">🔍 Scouting Hub</h2>
          <p className="text-ice-200 mt-1">Opponent analysis and tactical preparation</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-goal-500/10 border border-goal-500/30 rounded-lg">
          <Shield className="w-4 h-4 text-goal-400" />
          <span className="text-sm font-bold text-goal-300">Confidential</span>
        </div>
      </div>

      {/* Upcoming games */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-3">Upcoming Games</h3>
        {scheduledGames.length === 0 ? (
          <div className="glass-strong rounded-xl p-8 text-center border border-white/10">
            <p className="text-ice-300 font-semibold">No upcoming games scheduled</p>
            <p className="text-ice-500 text-sm mt-1">Add games from the Calendar view</p>
          </div>
        ) : (
          <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['Opponent', 'Date', 'Location', 'Report', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-ice-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scheduledGames.map((game, i) => {
                  const report = getReportForGame(game.id)
                  return (
                    <motion.tr key={game.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-ice-500 shrink-0" />
                          <span className="font-bold text-white">{game.opponent}</span>
                          <span className="text-xs text-ice-500">{game.homeAway === 'home' ? '🏠' : '✈️'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-white">{format(parseISO(game.gameDate), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-ice-400">{format(parseISO(game.gameDate), 'h:mm a')}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-ice-300">{game.location}</td>
                      <td className="px-5 py-4">
                        {report ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-300 border border-green-500/30">
                            <Target className="w-3 h-3" /> Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {report ? (
                            <button onClick={() => openView(game)} className="text-ice-400 hover:text-ice-200 text-sm font-semibold flex items-center gap-1 transition-colors">
                              <Eye className="w-3.5 h-3.5" /> View
                            </button>
                          ) : null}
                          <button
                            onClick={() => openAi(game)}
                            className="flex items-center gap-1 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> {report ? 'Regenerate' : 'AI Scout'}
                          </button>
                          {!report && (
                            <button onClick={() => openCreate(game)} className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center gap-1 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> Manual
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past reports */}
      {completedGamesWithReports.length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-3">Past Game Reports</h3>
          <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  {['Opponent', 'Date', 'Result', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-bold text-ice-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {completedGamesWithReports.map((game, i) => {
                  const report = getReportForGame(game.id)!
                  return (
                    <motion.tr key={game.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-bold text-white">{game.opponent}</td>
                      <td className="px-5 py-4 text-sm text-ice-300">{format(parseISO(game.gameDate), 'MMM d, yyyy')}</td>
                      <td className="px-5 py-4">
                        {game.teamScore !== null ? (
                          <span className={`text-sm font-bold ${game.teamScore > (game.opponentScore ?? 0) ? 'text-green-400' : game.teamScore < (game.opponentScore ?? 0) ? 'text-goal-400' : 'text-ice-300'}`}>
                            {game.teamScore} - {game.opponentScore}
                          </span>
                        ) : <span className="text-ice-500">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => openView(game)} className="text-ice-400 hover:text-ice-200 text-sm font-semibold flex items-center gap-1 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                          <button onClick={() => openEdit(game, report)} className="text-ice-400 hover:text-ice-200 text-sm font-semibold flex items-center gap-1 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" /> Edit
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && selectedGame && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed inset-4 md:inset-8 z-50 flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="glass-strong rounded-2xl flex flex-col h-full border border-white/10 shadow-2xl overflow-hidden">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-lg ${modalMode === 'ai' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-ice-500 to-ice-700'}`}>
                      {modalMode === 'ai' ? <Sparkles className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        {modalMode === 'ai' ? 'AI Scout' : modalMode === 'view' ? 'Scouting Report' : modalMode === 'edit' ? 'Edit Report' : 'New Report'} — vs {selectedGame.opponent}
                      </h2>
                      <p className="text-xs text-ice-400">{format(parseISO(selectedGame.gameDate), 'MMM d, yyyy')} · {selectedGame.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {modalMode === 'view' && (
                      <>
                        <button onClick={handlePrint} className="px-3 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all flex items-center gap-1.5">
                          <Printer className="w-4 h-4" /> Print
                        </button>
                        <button onClick={() => openEdit(selectedGame, selectedReport!)} className="px-3 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all flex items-center gap-1.5">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      </>
                    )}
                    <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                  {/* AI MODE */}
                  {modalMode === 'ai' && (
                    <div className="space-y-5 max-w-2xl mx-auto">
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                        <p className="text-white font-semibold mb-1">How it works</p>
                        <p className="text-ice-300 text-sm leading-relaxed">Paste any scouting notes, observations, or game film notes about <strong className="text-white">{selectedGame.opponent}</strong>. Claude will generate a complete structured scouting report including strengths, weaknesses, PP tendencies, goalie analysis, key players to watch, and tactical suggestions.</p>
                      </div>

                      <div>
                        <label className={labelClass}>Your Scouting Notes</label>
                        <textarea
                          value={aiNotes}
                          onChange={e => setAiNotes(e.target.value)}
                          rows={10}
                          placeholder={`Paste anything you know about ${selectedGame.opponent} here...\n\nExamples:\n- "Strong PP with umbrella setup, #27 runs the point"\n- "Goalie weak glove side, slow on rebounds"\n- "Fast wingers, like to stretch the ice on breakouts"\n- Game film notes, stat sheet observations, anything works\n\nOr leave empty and Claude will generate a general preparation template.`}
                          className={textareaClass}
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>

                      {aiError && (
                        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0" />{aiError}
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: generatingAi ? 1 : 1.02 }}
                        whileTap={{ scale: generatingAi ? 1 : 0.98 }}
                        onClick={handleGenerateAi}
                        disabled={generatingAi}
                        className="w-full py-3 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {generatingAi ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Claude is analyzing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Generate Scouting Report</>
                        )}
                      </motion.button>
                    </div>
                  )}

                  {/* VIEW MODE */}
                  {modalMode === 'view' && selectedReport && (
                    <div className="space-y-5 max-w-3xl" ref={printRef}>

                      {/* Key Players */}
                      {selectedReport.keyPlayersJson && (() => {
                        try {
                          const kp: KeyPlayer[] = JSON.parse(selectedReport.keyPlayersJson)
                          if (kp.length === 0) return null
                          return (
                            <div>
                              <p className={labelClass}>Key Players to Watch</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {kp.map((p, i) => (
                                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center text-white text-xs font-bold">
                                        {p.number || <User className="w-4 h-4" />}
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white">{p.name}</p>
                                        <p className="text-xs text-ice-400">{p.position}</p>
                                      </div>
                                    </div>
                                    <p className="text-xs text-ice-300 leading-relaxed">{p.notes}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        } catch { return null }
                      })()}

                      {/* Sections */}
                      {[
                        { label: 'Team Strengths', value: selectedReport.strengths, icon: <TrendingUp className="w-4 h-4 text-green-400" />, color: 'border-green-500/20 bg-green-500/5' },
                        { label: 'Weaknesses to Exploit', value: selectedReport.weaknesses, icon: <TrendingDown className="w-4 h-4 text-goal-400" />, color: 'border-goal-500/20 bg-goal-500/5' },
                        { label: 'Power Play Tendencies', value: selectedReport.powerPlayTendency, icon: <Target className="w-4 h-4 text-yellow-400" />, color: 'border-yellow-500/20 bg-yellow-500/5' },
                        { label: 'Goalie Weaknesses', value: selectedReport.goalieWeakness, icon: <Shield className="w-4 h-4 text-purple-400" />, color: 'border-purple-500/20 bg-purple-500/5' },
                        { label: 'Game Plan & Tactical Notes', value: selectedReport.tacticalNotes, icon: <ChevronRight className="w-4 h-4 text-ice-400" />, color: 'border-ice-500/20 bg-ice-500/5' },
                      ].filter(s => s.value).map(section => (
                        <div key={section.label} className={`rounded-xl p-5 border ${section.color}`}>
                          <div className="flex items-center gap-2 mb-3">
                            {section.icon}
                            <p className="text-xs font-bold text-ice-300 uppercase tracking-wider">{section.label}</p>
                          </div>
                          <p className="text-sm text-white leading-relaxed whitespace-pre-line">{section.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CREATE / EDIT MODE */}
                  {(modalMode === 'create' || modalMode === 'edit') && (
                    <div className="space-y-5 max-w-3xl">

                      {/* AI banner */}
                      <button
                        onClick={() => setModalMode('ai')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 transition-all text-left"
                      >
                        <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-white">Use AI to fill this report</p>
                          <p className="text-xs text-ice-400">Paste your scouting notes and Claude generates the full report</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-ice-500 ml-auto shrink-0" />
                      </button>

                      {/* Key Players */}
                      <div>
                        <label className={labelClass}>Key Players to Watch</label>
                        <div className="space-y-3">
                          {keyPlayers.map((player, i) => (
                            <div key={i} className="grid grid-cols-4 gap-3 p-4 bg-white/3 rounded-xl border border-white/5">
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-ice-400">{i + 1}</div>
                                <input name="name" value={player.name} onChange={e => updateKeyPlayer(i, 'name', e.target.value)} placeholder="Name" className={inputClass} style={{ colorScheme: 'dark' }} />
                              </div>
                              <input type="number" value={player.number || ''} onChange={e => updateKeyPlayer(i, 'number', parseInt(e.target.value) || 0)} placeholder="#" className={inputClass} style={{ colorScheme: 'dark' }} />
                              <input value={player.position} onChange={e => updateKeyPlayer(i, 'position', e.target.value)} placeholder="Position" className={inputClass} style={{ colorScheme: 'dark' }} />
                              <input value={player.notes} onChange={e => updateKeyPlayer(i, 'notes', e.target.value)} placeholder="Notes" className={inputClass} style={{ colorScheme: 'dark' }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths / Weaknesses */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>
                            <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-400" /> Team Strengths</span>
                          </label>
                          <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={4} placeholder="What are they good at?" className={textareaClass} style={{ colorScheme: 'dark' }} />
                        </div>
                        <div>
                          <label className={labelClass}>
                            <span className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-goal-400" /> Weaknesses to Exploit</span>
                          </label>
                          <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} rows={4} placeholder="What can we exploit?" className={textareaClass} style={{ colorScheme: 'dark' }} />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}><span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5 text-yellow-400" /> Power Play Tendencies</span></label>
                        <textarea value={powerPlayTendency} onChange={e => setPowerPlayTendency(e.target.value)} rows={3} placeholder="Formation, key plays, setup..." className={textareaClass} style={{ colorScheme: 'dark' }} />
                      </div>

                      <div>
                        <label className={labelClass}><span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-purple-400" /> Goalie Weaknesses</span></label>
                        <textarea value={goalieWeakness} onChange={e => setGoalieWeakness(e.target.value)} rows={3} placeholder="Glove side, blocker, five-hole, positioning..." className={textareaClass} style={{ colorScheme: 'dark' }} />
                      </div>

                      <div>
                        <label className={labelClass}>Game Plan & Tactical Notes</label>
                        <textarea value={tacticalNotes} onChange={e => setTacticalNotes(e.target.value)} rows={4} placeholder="How should we approach this game?" className={textareaClass} style={{ colorScheme: 'dark' }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {(modalMode === 'create' || modalMode === 'edit') && (
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                    <button onClick={() => setShowModal(false)} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: saving ? 1 : 1.03 }}
                      whileTap={{ scale: saving ? 1 : 0.97 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : selectedReport ? 'Update Report' : 'Save Report'}
                    </motion.button>
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
