import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Clock, Plus, Trash2, Loader2, Sparkles, Video, AlertTriangle, RotateCcw } from 'lucide-react'
import { fetchGameNotes, createGameNote, deleteGameNoteApi, fetchGameStats, GameNote, GamePlayerStat, Game } from '../api/api'

interface GameReviewPanelProps {
  game: Game
  teamId: string
  isOpen: boolean
  onClose: () => void
  onGeneratePlan: (game: Game) => void
}

const parseYouTubeId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
  return `${m}:${s.toString().padStart(2, '0')}` 
}

export default function GameReviewPanel({ game, teamId, isOpen, onClose, onGeneratePlan }: GameReviewPanelProps) {
  const [notes, setNotes] = useState<GameNote[]>([])
  const [stats, setStats] = useState<GamePlayerStat[]>([])
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoInput, setVideoInput] = useState('')

  // Stopwatch
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [activeTab, setActiveTab] = useState<'notes' | 'stats'>('notes')

  const loadData = async () => {
    try {
      setLoading(true)
      const [notesData, statsData] = await Promise.all([
        fetchGameNotes(game.id),
        fetchGameStats(game.id),
      ])
      setNotes(notesData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading game review data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTimer = () => {
    if (timerRunning) {
      clearInterval(timerRef.current!)
      setTimerRunning(false)
    } else {
      timerRef.current = setInterval(() => setTimerSeconds(s => s + 1), 1000)
      setTimerRunning(true)
    }
  }

  const resetTimer = () => {
    clearInterval(timerRef.current!)
    setTimerRunning(false)
    setTimerSeconds(0)
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    try {
      setAddingNote(true)
      const note = await createGameNote(game.id, teamId, timerSeconds, noteText.trim())
      setNotes(prev => [...prev, note].sort((a, b) => a.timestampSeconds - b.timestampSeconds))
      setNoteText('')
    } catch (err) {
      console.error('Error adding note:', err)
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteGameNoteApi(noteId)
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (err) {
      console.error('Error deleting note:', err)
    }
  }

  const handleSetVideo = () => {
    const id = parseYouTubeId(videoInput.trim())
    if (id) {
      setVideoId(id)
    }
  }

  const handleClose = () => {
    clearInterval(timerRef.current!)
    setTimerRunning(false)
    setTimerSeconds(0)
    setNoteText('')
    onClose()
  }

  useEffect(() => {
    if (isOpen && game) loadData()
  }, [isOpen, game])

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"

  const scoreDisplay = game.status === 'completed' && game.teamScore !== null
    ? `${game.teamScore} - ${game.opponentScore}` 
    : game.status

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed right-0 top-0 h-full z-50 w-full max-w-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="glass-strong h-full flex flex-col border-l border-white/10 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-ice-400 uppercase tracking-wider">{game.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${game.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {game.status === 'completed' ? `Final: ${scoreDisplay}` : 'Scheduled'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">vs {game.opponent}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onGeneratePlan(game)}
                    className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4" /> Generate Practice Plan
                  </motion.button>
                  <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Video Player */}
              <div className="px-6 py-4 border-b border-white/10 shrink-0">
                {videoId ? (
                  <div className="relative rounded-xl overflow-hidden bg-black" style={{ paddingBottom: '42%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <button
                      onClick={() => { setVideoId(null); setVideoInput('') }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all z-10"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-400" />
                      <input
                        value={videoInput}
                        onChange={e => setVideoInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSetVideo()}
                        placeholder="Paste YouTube URL to load game film..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-500 text-sm focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none"
                        style={{ colorScheme: 'dark' }}
                      />
                    </div>
                    <button
                      onClick={handleSetVideo}
                      disabled={!videoInput.trim()}
                      className="px-4 py-2.5 text-sm font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all disabled:opacity-40"
                    >
                      Load
                    </button>
                  </div>
                )}
              </div>

              {/* Stopwatch + Add Note */}
              <div className="px-6 py-3 border-b border-white/10 bg-white/3 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Timer */}
                  <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2 border border-white/10">
                    <Clock className="w-4 h-4 text-ice-400" />
                    <span className="font-mono text-lg font-bold text-white tabular-nums">{formatTime(timerSeconds)}</span>
                    <button onClick={toggleTimer} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${timerRunning ? 'bg-goal-500/30 text-goal-300 hover:bg-goal-500/50' : 'bg-green-500/30 text-green-300 hover:bg-green-500/50'}`}>
                      {timerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={resetTimer} className="w-7 h-7 rounded-full flex items-center justify-center text-ice-500 hover:text-ice-300 hover:bg-white/10 transition-all">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Note input */}
                  <div className="flex-1 flex gap-2">
                    <input
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                      placeholder={`Add note at ${formatTime(timerSeconds)}...`}
                      className={`${inputClass} flex-1`}
                      style={{ colorScheme: 'dark' }}
                    />
                    <motion.button
                      whileHover={{ scale: !noteText.trim() ? 1 : 1.03 }}
                      whileTap={{ scale: !noteText.trim() ? 1 : 0.97 }}
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || addingNote}
                      className="px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-40 flex items-center gap-1.5"
                    >
                      {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-6 py-3 border-b border-white/10 shrink-0">
                {[
                  { key: 'notes' as const, label: `Notes (${notes.length})` },
                  { key: 'stats' as const, label: `Game Stats (${stats.length})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key ? 'bg-white/10 text-white' : 'text-ice-400 hover:text-white hover:bg-white/5'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-ice-400" />
                  </div>
                ) : activeTab === 'notes' ? (
                  <div className="space-y-2">
                    {notes.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-10 h-10 text-ice-500 mx-auto mb-3" />
                        <p className="text-ice-300 font-semibold">No notes yet</p>
                        <p className="text-ice-500 text-sm mt-1">Start the timer and add notes while watching film</p>
                      </div>
                    ) : (
                      notes.map((note, i) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/8 group transition-all"
                        >
                          <span className="font-mono text-xs font-bold text-ice-400 bg-black/20 px-2 py-1 rounded shrink-0 mt-0.5">
                            {formatTime(note.timestampSeconds)}
                          </span>
                          <p className="text-sm text-white flex-1 leading-relaxed">{note.note}</p>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="w-6 h-6 flex items-center justify-center rounded text-ice-500 hover:text-goal-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stats.length === 0 ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-10 h-10 text-ice-500 mx-auto mb-3" />
                        <p className="text-ice-300 font-semibold">No stats recorded for this game</p>
                        <p className="text-ice-500 text-sm mt-1">Record stats from the calendar view to see them here</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-6 gap-2 pb-2 border-b border-white/10">
                          {['Player', 'G', 'A', 'SOG', 'BLK', 'PIM'].map(h => (
                            <div key={h} className={`text-xs font-bold text-ice-400 uppercase tracking-wider ${h === 'Player' ? '' : 'text-center'}`}>{h}</div>
                          ))}
                        </div>
                        {stats.map((s, i) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-6 gap-2 items-center py-2 hover:bg-white/5 rounded-lg px-1 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {s.jersey_number}
                              </div>
                              <span className="text-sm font-semibold text-white truncate">{s.first_name} {s.last_name}</span>
                            </div>
                            {[s.goals, s.assists, s.shots, s.blocks, s.pims].map((val, j) => (
                              <div key={j} className={`text-center text-sm font-bold ${val > 0 ? 'text-white' : 'text-ice-500'}`}>{val}</div>
                            ))}
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
