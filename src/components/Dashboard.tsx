import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, TrendingUp, Trophy, Edit2, Plus, X, Save,
  Trash2, AlertTriangle, Clock, Activity,
  Loader2, Target, Video, Shield, Users, BarChart3, ChevronRight
} from 'lucide-react'
import {
  fetchDashboard, fetchDashboardNotes, fetchTeamStats,
  createDashboardNote, updateDashboardNote, deleteDashboardNote,
  updateTeamSettings, DashboardData, DashboardNote, PlayerStats
} from '../api/api'
import { format, parseISO, formatDistanceToNow, isFuture } from 'date-fns'
import LoadingSpinner from './LoadingSpinner'

interface DashboardProps {
  teamId: string
  onNavigate: (view: string) => void
}

const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"
const labelClass = "block text-xs font-bold text-ice-400 uppercase tracking-wider mb-2"

const NOTE_CATEGORIES = ['Strategy', 'Defense', 'Offense', 'Special Teams', 'General']

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: 'bg-ice-500/20 text-ice-300 border-ice-500/30',
  Defense: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Offense: 'bg-green-500/20 text-green-300 border-green-500/30',
  'Special Teams': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  General: 'bg-white/10 text-ice-300 border-white/10',
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const target = new Date(targetDate)
      if (!isFuture(target)) { setTimeLeft('Game time!'); return }
      setTimeLeft(formatDistanceToNow(target, { addSuffix: false }))
    }
    update()
    const interval = setInterval(update, 60000)
    return () => clearInterval(interval)
  }, [targetDate])

  return <span>{timeLeft}</span>
}

export default function Dashboard({ teamId, onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [notes, setNotes] = useState<DashboardNote[]>([])
  const [topStats, setTopStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Team settings
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editSeason, setEditSeason] = useState('')
  const [editDivision, setEditDivision] = useState('')
  const [savingTeam, setSavingTeam] = useState(false)

  // Notes
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<DashboardNote | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('Strategy')
  const [savingNote, setSavingNote] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [dashData, notesData, statsData] = await Promise.all([
        fetchDashboard(teamId),
        fetchDashboardNotes(teamId),
        fetchTeamStats(teamId),
      ])
      setData(dashData)
      setNotes(notesData)
      setTopStats(statsData.slice(0, 3))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => { loadAll() }, [loadAll])

  const openTeamModal = () => {
    if (!data) return
    setEditName(data.team.name)
    setEditSeason(data.team.season)
    setEditDivision(data.team.division ?? '')
    setShowTeamModal(true)
  }

  const handleSaveTeam = async () => {
    try {
      setSavingTeam(true)
      await updateTeamSettings(teamId, { name: editName, season: editSeason, division: editDivision })
      await loadAll()
      setShowTeamModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingTeam(false)
    }
  }

  const openNoteModal = (note?: DashboardNote) => {
    if (note) {
      setEditingNote(note)
      setNoteTitle(note.title)
      setNoteContent(note.content)
      setNoteCategory(note.category ?? 'Strategy')
    } else {
      setEditingNote(null)
      setNoteTitle('')
      setNoteContent('')
      setNoteCategory('Strategy')
    }
    setShowNoteModal(true)
  }

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return
    try {
      setSavingNote(true)
      if (editingNote) {
        await updateDashboardNote(editingNote.id, { title: noteTitle, content: noteContent, category: noteCategory })
      } else {
        await createDashboardNote(teamId, { title: noteTitle, content: noteContent, category: noteCategory })
      }
      await loadAll()
      setShowNoteModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      setDeletingNoteId(noteId)
      await deleteDashboardNote(noteId)
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingNoteId(null)
    }
  }

  if (loading) return <LoadingSpinner message="Loading command center..." />

  if (error) return (
    <div className="p-8">
      <div className="glass-strong border border-goal-500/30 rounded-xl p-6 bg-goal-500/10">
        <p className="text-goal-300 font-semibold">Error loading dashboard</p>
        <p className="text-goal-200 text-sm mt-1">{error}</p>
      </div>
    </div>
  )

  if (!data) return null

  const { team, stats, nextGame, nextPractice, recentGames, injuredPlayersList } = data
  const winPct = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0
  const practiceDate = nextPractice?.practiceDate || nextPractice?.practice_date

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <p className="text-ice-400 text-sm font-semibold uppercase tracking-widest mb-1">Command Center</p>
          <h2 className="text-3xl md:text-4xl font-black text-white text-shadow">{team.name}</h2>
          <p className="text-ice-300 mt-1">{team.division} · {team.season}</p>
        </div>
        <button onClick={openTeamModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit team settings">
          <Edit2 className="w-4 h-4 text-ice-400" />
        </button>
      </motion.div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Record', value: `${stats.wins}-${stats.losses}-${stats.ties}`, sub: `${winPct}% win rate`, icon: '🏆', color: 'from-yellow-500/10 to-amber-500/10 border-yellow-500/20' },
          { label: 'Active Players', value: stats.activePlayers, sub: `${stats.totalPlayers} total`, icon: '🏒', color: 'from-green-500/10 to-emerald-500/10 border-green-500/20' },
          { label: 'Injured', value: stats.injuredPlayers, sub: stats.injuredPlayers > 0 ? 'on IR' : 'full strength!', icon: '🚑', color: stats.injuredPlayers > 0 ? 'from-goal-500/10 to-goal-600/10 border-goal-500/20' : 'from-green-500/10 to-emerald-500/10 border-green-500/20' },
          { label: 'Upcoming Games', value: stats.upcomingGames, sub: `${stats.totalGames} total`, icon: '📅', color: 'from-ice-500/10 to-ice-600/10 border-ice-500/20' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-strong rounded-xl p-5 border bg-gradient-to-br ${card.color}`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <p className={labelClass}>{card.label}</p>
            <p className="text-2xl font-black text-white">{card.value}</p>
            <p className="text-xs text-ice-400 mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN — Next Game + Next Practice + Injury Report */}
        <div className="space-y-4">

          {/* Next Game */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-ice-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Game</h3>
            </div>
            <div className="p-5">
              {nextGame ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-ice-400 uppercase tracking-wider mb-1">Opponent</p>
                    <p className="text-xl font-black text-white">{nextGame.opponent}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ice-300">
                    <Clock className="w-3.5 h-3.5 text-ice-500" />
                    <span>{format(parseISO(nextGame.gameDate), 'MMM d · h:mm a')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ice-300">
                    <Target className="w-3.5 h-3.5 text-ice-500" />
                    <span>{nextGame.location}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${nextGame.homeAway === 'home' ? 'bg-ice-500/20 text-ice-300 border border-ice-500/30' : 'bg-white/10 text-ice-300 border border-white/10'}`}>
                      {nextGame.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <Clock className="w-3 h-3" />
                      <Countdown targetDate={nextGame.gameDate} />
                    </div>
                  </div>
                  {/* Quick actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onNavigate('calendar')}
                      className="flex-1 py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-ice-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 border border-white/5"
                    >
                      <Video className="w-3.5 h-3.5" /> Review Game
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onNavigate('scouting')}
                      className="flex-1 py-2 text-xs font-bold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200 rounded-lg transition-all flex items-center justify-center gap-1.5 border border-purple-500/20"
                    >
                      <Shield className="w-3.5 h-3.5" /> Scout
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-ice-500 text-sm">No upcoming games</p>
                  <button onClick={() => onNavigate('calendar')} className="mt-3 text-xs font-semibold text-ice-400 hover:text-ice-200 transition-colors flex items-center gap-1 mx-auto">
                    <Plus className="w-3 h-3" /> Add a game
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Next Practice */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Practice</h3>
            </div>
            <div className="p-5">
              {nextPractice && practiceDate ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-ice-300">
                    <Clock className="w-3.5 h-3.5 text-ice-500" />
                    <span>{format(parseISO(practiceDate), 'MMM d · h:mm a')}</span>
                  </div>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-1">Focus</p>
                    <p className="text-sm font-semibold text-white">⚡ {nextPractice.focus}</p>
                  </div>
                  <button
                    onClick={() => onNavigate('calendar')}
                    className="w-full py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-ice-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 border border-white/5 mt-1"
                  >
                    <Calendar className="w-3.5 h-3.5" /> View Full Schedule
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-ice-500 text-sm">No upcoming practices</p>
                  <button onClick={() => onNavigate('calendar')} className="mt-3 text-xs font-semibold text-ice-400 hover:text-ice-200 transition-colors flex items-center gap-1 mx-auto">
                    <Plus className="w-3 h-3" /> Add a practice
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Injury Report */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-goal-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Injury Report</h3>
              {injuredPlayersList.length > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-goal-500/20 text-goal-300 border border-goal-500/30">
                  {injuredPlayersList.length}
                </span>
              )}
            </div>
            <div className="p-5">
              {injuredPlayersList.length === 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
                    <span>✓</span> Full strength — no injuries!
                  </div>
                  <button
                    onClick={() => onNavigate('team')}
                    className="w-full py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-ice-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 border border-white/5"
                  >
                    <Users className="w-3.5 h-3.5" /> View Roster
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {injuredPlayersList.map((player, i) => (
                    <motion.div key={player.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 p-3 bg-goal-500/10 border border-goal-500/20 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-goal-500/20 flex items-center justify-center text-xs font-bold text-goal-300 shrink-0">
                        {player.jerseyNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{player.firstName} {player.lastName}</p>
                        <p className="text-xs text-goal-300 truncate">{player.injuryNote || 'Injured'}</p>
                      </div>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => onNavigate('team')}
                    className="w-full py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-ice-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 border border-white/5 mt-1"
                  >
                    <Users className="w-3.5 h-3.5" /> Manage Roster
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* MIDDLE COLUMN — Recent Games + Top Performers */}
        <div className="space-y-4">

          {/* Recent Games */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Results</h3>
            </div>
            <div className="p-5">
              {recentGames.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-ice-500 text-sm">No completed games yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentGames.map((game, i) => {
                    const won = (game.teamScore ?? 0) > (game.opponentScore ?? 0)
                    const lost = (game.teamScore ?? 0) < (game.opponentScore ?? 0)
                    return (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-all border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${won ? 'bg-green-500/20 text-green-400' : lost ? 'bg-goal-500/20 text-goal-400' : 'bg-white/10 text-ice-400'}`}>
                            {won ? 'W' : lost ? 'L' : 'T'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{game.opponent}</p>
                            <p className="text-xs text-ice-500">{format(parseISO(game.gameDate), 'MMM d')}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-black ${won ? 'text-green-400' : lost ? 'text-goal-400' : 'text-ice-300'}`}>
                          {game.teamScore} – {game.opponentScore}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Performers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-ice-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Performers</h3>
            </div>
            <div className="p-5">
              {topStats.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-ice-500 text-sm">No stats recorded yet</p>
                  <button onClick={() => onNavigate('games')} className="mt-3 text-xs font-semibold text-ice-400 hover:text-ice-200 transition-colors flex items-center gap-1 mx-auto">
                    <ChevronRight className="w-3 h-3" /> Record game stats
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {topStats.map((player, i) => {
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-xl">{medals[i]}</span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {player.jersey_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{player.first_name} {player.last_name}</p>
                          <p className="text-xs text-ice-400 capitalize">{player.position.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-ice-300">{player.total_points}</p>
                          <p className="text-xs text-ice-500">{player.total_goals}G {player.total_assists}A</p>
                        </div>
                      </motion.div>
                    )
                  })}
                  <button
                    onClick={() => onNavigate('stats')}
                    className="w-full py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-ice-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-1.5 border border-white/5 mt-1"
                  >
                    <BarChart3 className="w-3.5 h-3.5" /> Full Stats Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN — Coach's Notes */}
        <div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-strong rounded-xl border border-white/10 overflow-hidden h-full">
            <div className="px-5 py-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Coach's Notes</h3>
              </div>
              <button onClick={() => openNoteModal()} className="w-7 h-7 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: '600px' }}>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-ice-300 font-semibold text-sm">No notes yet</p>
                  <p className="text-ice-500 text-xs mt-1">Click + to add a coaching note</p>
                </div>
              ) : (
                notes.map((note, i) => {
                  const catColor = CATEGORY_COLORS[note.category ?? 'General'] ?? CATEGORY_COLORS.General
                  return (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/8 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-bold text-white leading-tight">{note.title}</p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <button onClick={() => openNoteModal(note)} className="w-6 h-6 flex items-center justify-center rounded text-ice-500 hover:text-ice-300 transition-colors">
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deletingNoteId === note.id}
                            className="w-6 h-6 flex items-center justify-center rounded text-ice-500 hover:text-goal-400 transition-colors"
                          >
                            {deletingNoteId === note.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-ice-300 leading-relaxed mb-3">{note.content}</p>
                      <div className="flex items-center justify-between">
                        {note.category && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${catColor}`}>
                            {note.category}
                          </span>
                        )}
                        <span className="text-xs text-ice-500 ml-auto">
                          {format(parseISO(note.updated_at), 'MMM d')}
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Team Settings Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTeamModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="glass-strong rounded-xl w-full max-w-sm border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-lg font-bold text-white">Team Settings</h3>
                  <button onClick={() => setShowTeamModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div><label className={labelClass}>Team Name</label><input value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                  <div><label className={labelClass}>Season</label><input value={editSeason} onChange={e => setEditSeason(e.target.value)} placeholder="e.g. 2025-2026" className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                  <div><label className={labelClass}>Division</label><input value={editDivision} onChange={e => setEditDivision(e.target.value)} placeholder="e.g. NCAA D1" className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
                  <button onClick={() => setShowTeamModal(false)} className="px-4 py-2 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: savingTeam ? 1 : 1.03 }} whileTap={{ scale: savingTeam ? 1 : 0.97 }} onClick={handleSaveTeam} disabled={savingTeam} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2">
                    {savingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingTeam ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNoteModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
              <div className="glass-strong rounded-xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                  <h3 className="text-lg font-bold text-white">{editingNote ? 'Edit Note' : 'Add Note'}</h3>
                  <button onClick={() => setShowNoteModal(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all"><X className="w-4 h-4" /></button>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div><label className={labelClass}>Title</label><input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="e.g. Power Play Strategy" className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                  <div>
                    <label className={labelClass}>Content</label>
                    <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} rows={4} placeholder="Note details..." className={`${inputClass} resize-none`} style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className={labelClass}>Category</label>
                    <select value={noteCategory} onChange={e => setNoteCategory(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                      {NOTE_CATEGORIES.map(c => <option key={c} value={c} style={{ backgroundColor: '#1e3a5f' }}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-white/10 bg-white/5">
                  <button onClick={() => setShowNoteModal(false)} className="px-4 py-2 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                  <motion.button whileHover={{ scale: savingNote ? 1 : 1.03 }} whileTap={{ scale: savingNote ? 1 : 0.97 }} onClick={handleSaveNote} disabled={savingNote || !noteTitle.trim() || !noteContent.trim()} className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-60 flex items-center gap-2">
                    {savingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {savingNote ? 'Saving...' : editingNote ? 'Update' : 'Add Note'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
