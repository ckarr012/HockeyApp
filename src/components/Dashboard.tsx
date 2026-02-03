import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, TrendingUp, Users, Activity, Trophy, Edit2, Plus, X, Save, Trash2 } from 'lucide-react'
import { fetchDashboard, fetchDashboardNotes, createDashboardNote, updateDashboardNote, deleteDashboardNote, updateTeamSettings, DashboardData, DashboardNote } from '../api/api'

interface DashboardProps {
  teamId: string
}

export default function Dashboard({ teamId }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [notes, setNotes] = useState<DashboardNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Team settings edit state
  const [showTeamEditModal, setShowTeamEditModal] = useState(false)
  const [editTeamName, setEditTeamName] = useState('')
  const [editSeason, setEditSeason] = useState('')
  const [savingTeam, setSavingTeam] = useState(false)
  
  // Notes edit state
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [editingNote, setEditingNote] = useState<DashboardNote | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteCategory, setNoteCategory] = useState('')
  const [savingNote, setSavingNote] = useState(false)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const [dashData, notesData] = await Promise.all([
        fetchDashboard(teamId),
        fetchDashboardNotes(teamId)
      ])
      setDashboardData(dashData)
      setNotes(notesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [teamId])

  const handleEditTeam = () => {
    if (!dashboardData) return
    setEditTeamName(dashboardData.team.name)
    setEditSeason(dashboardData.team.season)
    setShowTeamEditModal(true)
  }

  const handleSaveTeam = async () => {
    try {
      setSavingTeam(true)
      await updateTeamSettings(teamId, {
        name: editTeamName,
        season: editSeason
      })
      setShowTeamEditModal(false)
      await loadDashboard()
    } catch (err) {
      console.error('Error updating team settings:', err)
      alert('Failed to update team settings')
    } finally {
      setSavingTeam(false)
    }
  }

  const handleAddNote = () => {
    setEditingNote(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteCategory('Strategy')
    setShowNoteModal(true)
  }

  const handleEditNote = (note: DashboardNote) => {
    setEditingNote(note)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteCategory(note.category || 'Strategy')
    setShowNoteModal(true)
  }

  const handleSaveNote = async () => {
    if (!noteTitle || !noteContent) {
      alert('Please fill in all fields')
      return
    }

    try {
      setSavingNote(true)
      if (editingNote) {
        await updateDashboardNote(editingNote.id, {
          title: noteTitle,
          content: noteContent,
          category: noteCategory
        })
      } else {
        await createDashboardNote(teamId, {
          title: noteTitle,
          content: noteContent,
          category: noteCategory
        })
      }
      setShowNoteModal(false)
      await loadDashboard()
    } catch (err) {
      console.error('Error saving note:', err)
      alert('Failed to save note')
    } finally {
      setSavingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await deleteDashboardNote(noteId)
      await loadDashboard()
    } catch (err) {
      console.error('Error deleting note:', err)
      alert('Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-ice-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-ice-200 text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No dashboard data available</p>
        </div>
      </div>
    )
  }

  const { team, stats, nextGame, nextPractice } = dashboardData
  const winRate = stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) : 0

  const statCards = [
    { label: 'Games Played', value: stats.totalGames, icon: Calendar, color: 'ice', gradient: 'from-ice-500 to-ice-600' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Trophy, color: 'green', gradient: 'from-green-500 to-emerald-600' },
    { label: 'Record', value: `${stats.wins}-${stats.losses}-${stats.ties}`, icon: TrendingUp, color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
  ]

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-start justify-between"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Welcome back, Coach</h2>
          <p className="text-ice-200 text-lg">{team.name} • {team.season}</p>
        </div>
        <motion.button
          onClick={handleEditTeam}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Edit team settings"
        >
          <Edit2 className="w-5 h-5 text-ice-400" />
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass-strong rounded-xl shadow-2xl border border-white/20 p-6 relative overflow-hidden group cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-ice-200 uppercase tracking-wide">{card.label}</p>
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className={`w-8 h-8 text-${card.color}-400`} />
                  </motion.div>
                </div>
                <motion.p
                  className="text-4xl font-bold text-white"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
                >
                  {card.value}
                </motion.p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Game */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-ice-400" />
              Next Game
            </h3>
          </div>
          <div className="p-6">
            {nextGame ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-gradient-to-br from-ice-900/50 to-ice-800/50 rounded-lg border border-ice-500/30"
              >
                <div>
                  <p className="font-bold text-white text-lg">
                    {new Date(nextGame.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {nextGame.opponent}
                  </p>
                  <p className="text-sm text-ice-200 mt-1">
                    {new Date(nextGame.gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {nextGame.location}
                  </p>
                </div>
                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                  nextGame.homeAway === 'home' 
                    ? 'bg-ice-500 text-white shadow-glow-blue' 
                    : 'bg-white/20 text-ice-200'
                }`}>
                  {nextGame.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}
                </span>
              </motion.div>
            ) : (
              <p className="text-ice-300 text-center py-8">No upcoming games scheduled</p>
            )}
          </div>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-ice-400" />
              Team Overview
            </h3>
          </div>
          <div className="p-6 space-y-3">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10"
            >
              <span className="text-sm text-ice-200 font-medium">Total Players</span>
              <span className="font-bold text-white text-lg">{stats.totalPlayers}</span>
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/30"
            >
              <span className="text-sm text-green-200 font-medium">Active</span>
              <span className="font-bold text-green-400 text-lg">{stats.activePlayers}</span>
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/30"
            >
              <span className="text-sm text-red-200 font-medium">Injured</span>
              <span className="font-bold text-red-400 text-lg">{stats.injuredPlayers}</span>
            </motion.div>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex justify-between items-center p-3 bg-ice-500/10 rounded-lg border border-ice-500/30"
            >
              <span className="text-sm text-ice-200 font-medium">Videos</span>
              <span className="font-bold text-ice-400 text-lg">{stats.totalVideos}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Pinned Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-ice-400" />
              Pinned Notes
            </h3>
            <motion.button
              onClick={handleAddNote}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Add note"
            >
              <Plus className="w-5 h-5 text-ice-400" />
            </motion.button>
          </div>
          <div className="p-6 space-y-3">
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className="p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-l-4 border-yellow-400 rounded-lg cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start flex-1">
                      <span className="text-2xl mr-3">📌</span>
                      <div className="flex-1">
                        <p className="font-bold text-white">{note.title}</p>
                        <p className="text-sm text-ice-200 mt-1">{note.content}</p>
                        {note.category && (
                          <span className="inline-block mt-2 px-2 py-1 bg-white/10 rounded text-xs text-ice-300">
                            {note.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditNote(note)
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Edit2 className="w-4 h-4 text-ice-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNote(note.id)
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-ice-300 text-center py-8">No notes yet. Click + to add one!</p>
            )}
          </div>
        </motion.div>

        {/* Practice Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-ice-400" />
              Next Practice
            </h3>
          </div>
          <div className="p-6">
            {nextPractice ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-l-4 border-green-400 rounded-lg"
              >
                <p className="font-bold text-white text-lg">
                  {new Date(nextPractice.practiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                  {new Date(nextPractice.practiceDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="text-sm text-green-200 mt-2">⚡ {nextPractice.focus}</p>
              </motion.div>
            ) : (
              <p className="text-ice-300 text-center py-8">No upcoming practices scheduled</p>
            )}
          </div>
        </motion.div>

        {/* Recent Games with Win/Loss */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden lg:col-span-2"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-ice-400" />
              Recent Games
            </h3>
          </div>
          <div className="p-6">
            {dashboardData?.stats && dashboardData.stats.totalGames > 0 ? (
              <div className="space-y-3">
                {/* This would ideally fetch recent games from the API */}
                {/* For now, showing placeholder for the UI */}
                <div className="text-ice-300 text-center py-4">
                  <p className="font-medium">Click on Schedule or Games to record game results</p>
                  <p className="text-sm mt-2">Win/Loss records will appear here once games are completed</p>
                </div>
              </div>
            ) : (
              <p className="text-ice-300 text-center py-8">No games played yet</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Team Settings Edit Modal */}
      <AnimatePresence>
        {showTeamEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowTeamEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-md w-full border border-white/20"
            >
              <div className="px-6 py-5 bg-ice-500 flex items-center justify-between rounded-t-xl">
                <h3 className="text-2xl font-black text-white">Edit Team Settings</h3>
                <button
                  onClick={() => setShowTeamEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Team Name</label>
                  <input
                    type="text"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Season</label>
                  <input
                    type="text"
                    value={editSeason}
                    onChange={(e) => setEditSeason(e.target.value)}
                    placeholder="e.g., 2025-2026"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end space-x-3 rounded-b-xl">
                <button
                  onClick={() => setShowTeamEditModal(false)}
                  className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTeam}
                  disabled={savingTeam}
                  className="px-5 py-2 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingTeam ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note Edit Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-lg w-full border border-white/20"
            >
              <div className="px-6 py-5 bg-ice-500 flex items-center justify-between rounded-t-xl">
                <h3 className="text-2xl font-black text-white">
                  {editingNote ? 'Edit Note' : 'Add New Note'}
                </h3>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Title</label>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g., Power Play Strategy"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Content</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter note details..."
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  >
                    <option value="Strategy">Strategy</option>
                    <option value="Defense">Defense</option>
                    <option value="Offense">Offense</option>
                    <option value="Special Teams">Special Teams</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end space-x-3 rounded-b-xl">
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  disabled={savingNote}
                  className="px-5 py-2 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingNote ? 'Saving...' : editingNote ? 'Update Note' : 'Add Note'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
