import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, RefreshCw, Loader2, CheckCircle2, AlertTriangle,
  Users, Calendar, BarChart2, Download, Sparkles,
  Shield
} from 'lucide-react'
import {
  fetchAchaRoster, fetchAchaSchedule, fetchAchaStats,
  syncOpponentRoster, syncOpponentStats, generateScoutingFromAcha,
  createPlayer, createGame, fetchPlayers, fetchGames,
  createScoutingReport, updateScoutingReport, fetchScoutingReports,
  AchaPlayer, AchaGame, AchaStat, OpponentPlayer, OpponentStat
} from '../api/api'

interface AchaSyncModalProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
  onSyncComplete: (destination?: string) => void
}

type SyncTab = 'myteam' | 'opponent'
type DataType = 'roster' | 'schedule' | 'stats' | 'all'
type Step = 'select' | 'loading' | 'preview' | 'importing' | 'done'

const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"
const labelClass = "text-xs font-bold text-ice-400 uppercase tracking-wider"

export default function AchaSyncModal({ teamId, isOpen, onClose, onSyncComplete }: AchaSyncModalProps) {
  const [tab, setTab] = useState<SyncTab>('myteam')
  const [dataType, setDataType] = useState<DataType>('roster')
  const [opponentUrl, setOpponentUrl] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [step, setStep] = useState<Step>('select')
  const [error, setError] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  // My team preview data
  const [rosterPreview, setRosterPreview] = useState<(AchaPlayer & { selected: boolean })[]>([])
  const [schedulePreview, setSchedulePreview] = useState<(AchaGame & { selected: boolean })[]>([])
  const [statsPreview, setStatsPreview] = useState<AchaStat[]>([])

  // Opponent data
  const [opponentRoster, setOpponentRoster] = useState<OpponentPlayer[]>([])
  const [opponentStats, setOpponentStats] = useState<OpponentStat[]>([])
  const [opponentSchedulePreview, setOpponentSchedulePreview] = useState<AchaGame[]>([])

  const [importedCount, setImportedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [loadingPhase, setLoadingPhase] = useState('')

  const reset = () => {
    setStep('select'); setError(null)
    setRosterPreview([]); setSchedulePreview([]); setStatsPreview([])
    setOpponentRoster([]); setOpponentStats([]); setOpponentSchedulePreview([])
    setImportedCount(0); setSkippedCount(0)
    setOpponentUrl(''); setOpponentName(''); setLoadingPhase('')
    setGeneratingReport(false); setReportGenerated(false)
  }

  const handleClose = () => { reset(); onClose() }

  // ── MY TEAM FETCH ──
  const handleMyTeamFetch = async () => {
    setError(null)
    setStep('loading')
    try {
      if (dataType === 'roster') {
        setLoadingPhase('Fetching Roosevelt roster from ACHA...')
        const players = await fetchAchaRoster()
        setRosterPreview(players.map(p => ({ ...p, selected: true })))
      } else if (dataType === 'schedule') {
        setLoadingPhase('Fetching Roosevelt schedule from ACHA...')
        const games = await fetchAchaSchedule()
        setSchedulePreview(games.map(g => ({ ...g, selected: true })))
      } else {
        setLoadingPhase('Fetching Roosevelt stats from ACHA...')
        const stats = await fetchAchaStats()
        setStatsPreview(stats)
      }
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed. Try again.')
      setStep('select')
    }
  }

  // ── OPPONENT FETCH (all at once) ──
  const handleOpponentFetch = async () => {
    if (!opponentUrl.trim()) { setError('Please enter the opponent\'s ACHA URL'); return }
    if (!opponentName.trim()) { setError('Please enter the opponent\'s team name'); return }
    setError(null)
    setStep('loading')

    try {
      setLoadingPhase(`Fetching ${opponentName} roster...`)
      const roster = await syncOpponentRoster(opponentUrl.trim(), opponentName.trim(), teamId)
      setOpponentRoster(roster)

      setLoadingPhase(`Fetching ${opponentName} stats...`)
      const statsUrl = opponentUrl.replace('/stats/roster/', '/stats/player-stats/')
      const stats = await syncOpponentStats(statsUrl.trim(), opponentName.trim(), teamId)
      setOpponentStats(stats)

      setLoadingPhase(`Fetching ${opponentName} schedule...`)
      const schedUrl = opponentUrl.replace('/stats/roster/', '/stats/schedule/')
      try {
        const schedResult = await fetch(`http://localhost:5000/api/acha/sync-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: schedUrl, type: 'schedule' }),
        })
        if (schedResult.ok) {
          const schedData = await schedResult.json()
          setOpponentSchedulePreview(schedData.games || [])
        }
      } catch {}

      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scraping failed. Try again.')
      setStep('select')
    }
  }

  // ── MY TEAM IMPORT ──
  const handleMyTeamImport = async () => {
    setStep('importing')
    let count = 0; let skipped = 0

    try {
      if (dataType === 'roster') {
        const existing = await fetchPlayers(teamId)
        const existingNums = new Set(existing.map(p => p.jerseyNumber))
        const existingNames = new Set(existing.map(p => `${p.firstName.toLowerCase()} ${p.lastName.toLowerCase()}`))

        for (const player of rosterPreview.filter(p => p.selected)) {
          const name = `${player.firstName.toLowerCase()} ${player.lastName.toLowerCase()}` 
          if (existingNums.has(player.jerseyNumber) || existingNames.has(name)) { skipped++; continue }
          try {
            await createPlayer(teamId, {
              firstName: player.firstName, lastName: player.lastName,
              jerseyNumber: player.jerseyNumber || 0,
              position: mapPosition(player.position),
              shoots: 'left',
              height: parseHeight(player.height),
              weight: player.weight ?? undefined,
              status: 'active',
            })
            count++
          } catch {}
        }
      } else if (dataType === 'schedule') {
        const existing = await fetchGames(teamId)
        const existingKeys = new Set(existing.map(g => `${g.opponent.toLowerCase()}-${new Date(g.gameDate).toDateString()}`))

        for (const game of schedulePreview.filter(g => g.selected)) {
          const key = `${game.opponent.toLowerCase()}-${new Date(game.gameDate).toDateString()}` 
          if (existingKeys.has(key)) { skipped++; continue }
          try {
            await createGame(teamId, {
              game_date: game.gameDate, opponent: game.opponent,
              location: game.location || 'TBD',
              home_away: game.homeAway, status: game.status,
            })
            count++
          } catch {}
        }
      }
      setImportedCount(count); setSkippedCount(skipped)
      setStep('done')
      onSyncComplete('team')
    } catch (err) {
      setError('Import failed.'); setStep('preview')
    }
  }

  // ── OPPONENT GENERATE SCOUTING ──
  const handleGenerateScoutingReport = async () => {
    setGeneratingReport(true)
    setError(null)
    try {
      const report = await generateScoutingFromAcha(opponentName, teamId, opponentRoster, opponentStats)

      const existingReports = await fetchScoutingReports(teamId)
      const existing = existingReports.find(r => r.opponentName?.toLowerCase() === opponentName.toLowerCase())

      const reportData = {
        opponent_name: opponentName,
        game_id: existing?.gameId || null,
        date: new Date().toISOString(),
        strengths: report.strengths,
        weaknesses: report.weaknesses,
        key_players: report.keyPlayers,
        tactical_notes: report.tacticalNotes + (report.lineMatchupSuggestions ? `\n\nLine Matchups: ${report.lineMatchupSuggestions}` : ''),
        power_play_tendency: report.powerPlayTendency,
        goalie_weakness: report.goalieWeakness,
      }

      if (existing) {
        await updateScoutingReport(existing.id, reportData)
      } else {
        await createScoutingReport(teamId, { ...reportData, game_id: 'pending' })
      }

      setReportGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report.')
    } finally {
      setGeneratingReport(false)
    }
  }

  const mapPosition = (pos: string): string => {
    const p = (pos || '').toLowerCase()
    if (p.includes('g')) return 'goalie'
    if (p === 'lw' || p === 'l') return 'left_wing'
    if (p === 'rw' || p === 'r') return 'right_wing'
    if (p === 'c') return 'center'
    if (p === 'ld') return 'left_defense'
    if (p.includes('d')) return 'right_defense'
    return 'center'
  }

  const parseHeight = (h: string | null): number | undefined => {
    if (!h) return undefined
    const match = h.match(/(\d+)'(\d+)"?/)
    if (match) return Math.round(parseInt(match[1]) * 30.48 + parseInt(match[2]) * 2.54)
    return undefined
  }

  const nextMatchup = opponentSchedulePreview.find(g =>
    g.status === 'scheduled' && g.opponent?.toLowerCase().includes('roosevelt')
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">ACHA Sync</h2>
                    <p className="text-xs text-ice-300">Import data from achahockey.org</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* SELECT */}
                {step === 'select' && (
                  <div className="space-y-5">

                    {/* Tab toggle */}
                    <div className="flex gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                      {[
                        { key: 'myteam' as SyncTab, label: '🏒 My Team', sub: 'Roosevelt University' },
                        { key: 'opponent' as SyncTab, label: '🔍 Scout Opponent', sub: 'Any ACHA team' },
                      ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2.5 px-4 rounded-lg transition-all ${tab === t.key ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'text-ice-400 hover:text-white hover:bg-white/5'}`}>
                          <p className="text-sm font-bold">{t.label}</p>
                          <p className="text-xs opacity-70">{t.sub}</p>
                        </button>
                      ))}
                    </div>

                    {/* My team options */}
                    {tab === 'myteam' && (
                      <div>
                        <label className={`${labelClass} mb-3 block`}>What to import</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { key: 'roster' as DataType, label: 'Roster', icon: <Users className="w-5 h-5" />, desc: '→ Your team roster' },
                            { key: 'schedule' as DataType, label: 'Schedule', icon: <Calendar className="w-5 h-5" />, desc: '→ Your calendar' },
                            { key: 'stats' as DataType, label: 'Stats', icon: <BarChart2 className="w-5 h-5" />, desc: '→ Preview only' },
                          ].map(dt => (
                            <button key={dt.key} onClick={() => setDataType(dt.key)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${dataType === dt.key ? 'bg-green-500/20 border-green-500/40 text-white' : 'bg-white/3 border-white/10 text-ice-400 hover:bg-white/8 hover:text-white'}`}>
                              {dt.icon}
                              <span className="text-sm font-bold">{dt.label}</span>
                              <span className="text-xs opacity-70 text-center">{dt.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Opponent options */}
                    {tab === 'opponent' && (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1">
                          <p className="text-sm font-bold text-white flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /> Full Opponent Intelligence</p>
                          <p className="text-xs text-ice-300 leading-relaxed">Paste any ACHA team's roster page URL. We'll scrape their roster, stats, and schedule — then auto-generate an AI scouting report. Everything saves to your Scouting Hub.</p>
                        </div>

                        <div>
                          <label className={`${labelClass} mb-2 block`}>Opponent Team Name *</label>
                          <input
                            value={opponentName}
                            onChange={e => setOpponentName(e.target.value)}
                            placeholder="e.g. Illinois State"
                            className={inputClass}
                            style={{ colorScheme: 'dark' }}
                          />
                        </div>

                        <div>
                          <label className={`${labelClass} mb-2 block`}>Opponent ACHA Roster URL *</label>
                          <input
                            value={opponentUrl}
                            onChange={e => setOpponentUrl(e.target.value)}
                            placeholder="https://www.achahockey.org/stats/roster/XXX/60"
                            className={inputClass}
                            style={{ colorScheme: 'dark' }}
                          />
                          <p className="text-xs text-ice-500 mt-1.5">Go to achahockey.org → find their team → copy the roster page URL</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { icon: <Users className="w-4 h-4" />, label: 'Roster', sub: '→ Scouting Hub' },
                            { icon: <BarChart2 className="w-4 h-4" />, label: 'Stats', sub: '→ Scouting Hub' },
                            { icon: <Sparkles className="w-4 h-4" />, label: 'AI Report', sub: '→ Auto-generated' },
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 p-3 bg-white/3 rounded-xl border border-white/5">
                              <span className="text-purple-400">{item.icon}</span>
                              <span className="text-xs font-bold text-white">{item.label}</span>
                              <span className="text-xs text-ice-500">{item.sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                      </div>
                    )}
                  </div>
                )}

                {/* LOADING */}
                {step === 'loading' && (
                  <div className="flex flex-col items-center justify-center py-16 gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-lg font-bold">Fetching from ACHA...</p>
                      <p className="text-ice-400 text-sm mt-1">{loadingPhase || 'Opening headless browser...'}</p>
                      <p className="text-ice-500 text-xs mt-1">This takes 15-30 seconds</p>
                    </div>
                    <Loader2 className="w-5 h-5 animate-spin text-green-400" />
                  </div>
                )}

                {/* PREVIEW */}
                {step === 'preview' && (
                  <div className="space-y-5">

                    {/* MY TEAM PREVIEWS */}
                    {tab === 'myteam' && dataType === 'roster' && rosterPreview.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">{rosterPreview.length} players found on ACHA</p>
                          <button onClick={() => setRosterPreview(prev => { const all = prev.every(p => p.selected); return prev.map(p => ({ ...p, selected: !all })) })} className="text-xs font-bold text-ice-400 hover:text-ice-200">
                            {rosterPreview.every(p => p.selected) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-white/10 max-h-80 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 w-8" />
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">#</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">Name</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">Pos</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {rosterPreview.map((p, i) => (
                                <tr key={i} onClick={() => setRosterPreview(prev => prev.map((pl, idx) => idx === i ? { ...pl, selected: !pl.selected } : pl))} className={`cursor-pointer transition-colors ${p.selected ? 'bg-white/5' : 'opacity-40'}`}>
                                  <td className="px-3 py-2"><div className={`w-4 h-4 rounded border flex items-center justify-center ${p.selected ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>{p.selected && <CheckCircle2 className="w-3 h-3 text-white" />}</div></td>
                                  <td className="px-3 py-2 font-bold text-ice-200">{p.jerseyNumber || '—'}</td>
                                  <td className="px-3 py-2 font-semibold text-white">{p.firstName} {p.lastName}</td>
                                  <td className="px-3 py-2 text-ice-400 text-xs uppercase">{p.position}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-ice-500 text-center">{rosterPreview.filter(p => p.selected).length} of {rosterPreview.length} selected · Duplicates will be skipped automatically</p>
                      </>
                    )}

                    {tab === 'myteam' && dataType === 'schedule' && schedulePreview.length > 0 && (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-white font-semibold">{schedulePreview.length} games found</p>
                          <button onClick={() => setSchedulePreview(prev => { const all = prev.every(g => g.selected); return prev.map(g => ({ ...g, selected: !all })) })} className="text-xs font-bold text-ice-400 hover:text-ice-200">
                            {schedulePreview.every(g => g.selected) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-white/10 max-h-80 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                              <tr>
                                <th className="px-3 py-2 w-8" />
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">Date</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">Opponent</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-ice-400">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {schedulePreview.map((g, i) => (
                                <tr key={i} onClick={() => setSchedulePreview(prev => prev.map((gm, idx) => idx === i ? { ...gm, selected: !gm.selected } : gm))} className={`cursor-pointer transition-colors ${g.selected ? 'bg-white/5' : 'opacity-40'}`}>
                                  <td className="px-3 py-2"><div className={`w-4 h-4 rounded border flex items-center justify-center ${g.selected ? 'bg-green-500 border-green-500' : 'border-white/30'}`}>{g.selected && <CheckCircle2 className="w-3 h-3 text-white" />}</div></td>
                                  <td className="px-3 py-2 text-ice-300 text-xs">{g.gameDate ? new Date(g.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                                  <td className="px-3 py-2 font-semibold text-white">{g.homeAway === 'away' ? '✈️ ' : '🏠 '}{g.opponent}</td>
                                  <td className="px-3 py-2 text-xs font-bold text-ice-300">{g.teamScore !== null ? `${g.teamScore}–${g.opponentScore}` : 'Sched.'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {tab === 'myteam' && dataType === 'stats' && statsPreview.length > 0 && (
                      <>
                        <p className="text-white font-semibold">{statsPreview.length} players — read only reference</p>
                        <div className="rounded-xl overflow-hidden border border-white/10 max-h-80 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10 sticky top-0">
                              <tr>{['Player', 'GP', 'G', 'A', 'PTS'].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-bold text-ice-400">{h}</th>)}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {statsPreview.map((s, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                  <td className="px-3 py-2 font-semibold text-white">{s.name}</td>
                                  <td className="px-3 py-2 text-ice-300">{s.gamesPlayed}</td>
                                  <td className="px-3 py-2 text-ice-300">{s.goals}</td>
                                  <td className="px-3 py-2 text-ice-300">{s.assists}</td>
                                  <td className="px-3 py-2 font-bold text-white">{s.points}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                    {/* OPPONENT PREVIEW */}
                    {tab === 'opponent' && (
                      <div className="space-y-5">

                        {nextMatchup && (
                          <div className="flex items-center gap-3 p-4 bg-ice-500/10 border border-ice-500/20 rounded-xl">
                            <Calendar className="w-5 h-5 text-ice-400 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-ice-400 uppercase tracking-wider">Next Matchup vs {opponentName}</p>
                              <p className="text-sm font-bold text-white">{new Date(nextMatchup.gameDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            </div>
                          </div>
                        )}

                        {opponentRoster.length > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">{opponentRoster.length} players saved to Scouting Hub</p>
                              <p className="text-xs text-ice-400">{opponentName} roster is now available in your scouting reports</p>
                            </div>
                          </div>
                        )}

                        {opponentStats.length > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-white">{opponentStats.length} player stats saved to Scouting Hub</p>
                              <p className="text-xs text-ice-400">Top scorer: {opponentStats[0]?.playerName} — {opponentStats[0]?.points} pts</p>
                            </div>
                          </div>
                        )}

                        {opponentStats.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Top Performers</p>
                            <div className="space-y-2">
                              {opponentStats.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                                    <span className="text-sm font-semibold text-white">{s.playerName}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-black text-ice-300">{s.points} pts</span>
                                    <span className="text-xs text-ice-500 ml-2">{s.goals}G {s.assists}A</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {opponentRoster.length > 0 && opponentStats.length > 0 && (
                          <div className={`rounded-xl border p-4 transition-all ${reportGenerated ? 'bg-green-500/10 border-green-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                            {reportGenerated ? (
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                                <div>
                                  <p className="text-sm font-bold text-white">AI Scouting Report generated!</p>
                                  <p className="text-xs text-ice-400">Saved to your Scouting Hub for {opponentName}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-sm font-bold text-white flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-purple-400" /> Generate AI Scouting Report</p>
                                  <p className="text-xs text-ice-400 mt-0.5">Claude will analyze their roster + stats and build a full report</p>
                                </div>
                                <motion.button
                                  whileHover={{ scale: generatingReport ? 1 : 1.03 }}
                                  whileTap={{ scale: generatingReport ? 1 : 0.97 }}
                                  onClick={handleGenerateScoutingReport}
                                  disabled={generatingReport}
                                  className="shrink-0 px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg transition-all disabled:opacity-60 flex items-center gap-1.5"
                                >
                                  {generatingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                  {generatingReport ? 'Generating...' : 'Generate'}
                                </motion.button>
                              </div>
                            )}
                          </div>
                        )}

                        {error && (
                          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* IMPORTING */}
                {step === 'importing' && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-green-400" />
                    <p className="text-white font-bold">Saving to your app...</p>
                  </div>
                )}

                {/* DONE */}
                {step === 'done' && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                      <CheckCircle2 className="w-16 h-16 text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white text-xl font-bold">{importedCount} {dataType === 'roster' ? 'players' : 'games'} imported!</p>
                      {skippedCount > 0 && <p className="text-ice-400 text-sm mt-1">{skippedCount} skipped — already in your app</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                {step === 'done' ? (
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleClose} className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg">Done</motion.button>
                ) : step === 'preview' && tab === 'opponent' ? (
                  <>
                    <button onClick={() => setStep('select')} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">← Back</button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => { onSyncComplete('scouting'); handleClose() }} className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Go to Scouting Hub
                    </motion.button>
                  </>
                ) : step === 'preview' && tab === 'myteam' ? (
                  <>
                    <button onClick={() => setStep('select')} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">← Back</button>
                    {dataType !== 'stats' && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleMyTeamImport} className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Import {dataType === 'roster' ? `${rosterPreview.filter(p => p.selected).length} Players` : `${schedulePreview.filter(g => g.selected).length} Games`}
                      </motion.button>
                    )}
                  </>
                ) : step === 'select' ? (
                  <>
                    <button onClick={handleClose} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={tab === 'myteam' ? handleMyTeamFetch : handleOpponentFetch}
                      className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> {tab === 'myteam' ? 'Fetch from ACHA' : `Scout ${opponentName || 'Opponent'}`}
                    </motion.button>
                  </>
                ) : null}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
