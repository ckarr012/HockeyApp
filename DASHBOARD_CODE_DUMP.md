# Hockey App — Dashboard Code Dump

---

## FILE: src/components/Dashboard.tsx

```tsx
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
```

---

## FILE: src/api/api.ts (dashboard-related types and functions)

```ts
export interface DashboardNote {
  id: string;
  team_id: string;
  title: string;
  content: string;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  team: {
    id: string;
    name: string;
    division: string;
    season: string;
  };
  stats: {
    totalPlayers: number;
    activePlayers: number;
    injuredPlayers: number;
    totalGames: number;
    wins: number;
    losses: number;
    ties: number;
    upcomingGames: number;
    totalVideos: number;
    totalPractices: number;
  };
  nextGame: Game | null;
  nextPractice: {
    id: string;
    teamId: string;
    practiceDate: string;
    focus: string;
  } | null;
}

export async function fetchDashboard(teamId: string): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/dashboard`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
  }
  return response.json();
}

// Dashboard Notes API
export async function fetchDashboardNotes(teamId: string): Promise<DashboardNote[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`);
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard notes: ${response.statusText}`);
  }
  const data = await response.json();
  return data.notes;
}

export async function createDashboardNote(teamId: string, noteData: { title: string; content: string; category?: string }): Promise<{ noteId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create dashboard note: ${response.statusText}`);
  }
  return response.json();
}

export async function updateDashboardNote(noteId: string, noteData: { title: string; content: string; category?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!response.ok) {
    throw new Error(`Failed to update dashboard note: ${response.statusText}`);
  }
}

export async function deleteDashboardNote(noteId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/notes/${noteId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete dashboard note: ${response.statusText}`);
  }
}

// Team Settings API
export async function updateTeamSettings(teamId: string, settings: { name?: string; season?: string; division?: string }): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`Failed to update team settings: ${response.statusText}`);
  }
}
```

---

## FILE: backend/routes/dashboardNotesRoutes.js

```js
const express = require('express');
const router = express.Router();
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote
} = require('../controllers/dashboardNotesController');

router.get('/:teamId/notes', getNotes);
router.post('/:teamId/notes', createNote);
router.put('/notes/:noteId', updateNote);
router.delete('/notes/:noteId', deleteNote);

module.exports = router;
```

---

## FILE: backend/routes/teamRoutes.js (dashboard + settings routes)

```js
const express = require('express');
const router = express.Router();
const { getPlayers, addPlayer, getDashboard, getGames, addGame, updateScore, removeGame, removeVideo, updateSettings } = require('../controllers/teamController');
const { getGameNotes, addGameNote, removeGameNote, generatePracticePlan } = require('../controllers/gameReviewController');

router.get('/:teamId/players', getPlayers);
router.post('/:teamId/players', addPlayer);

router.get('/:teamId/dashboard', getDashboard);

router.get('/:teamId/games', getGames);
router.post('/:teamId/games', addGame);
router.put('/games/:gameId/score', updateScore);
router.delete('/games/:gameId', removeGame);
router.delete('/videos/:videoId', removeVideo);

router.get('/games/:gameId/notes', getGameNotes);
router.post('/games/:gameId/notes', addGameNote);
router.delete('/games/notes/:noteId', removeGameNote);
router.post('/games/:gameId/practice-plan', generatePracticePlan);

router.put('/:teamId/settings', updateSettings);

module.exports = router;
```

---

## FILE: backend/controllers/dashboardNotesController.js

```js
const {
  getDashboardNotes,
  createDashboardNote,
  updateDashboardNote,
  deleteDashboardNote
} = require('../models/dashboardNotesModel');

const getNotes = async (req, res) => {
  try {
    const { teamId } = req.params;
    const notes = await getDashboardNotes(teamId);
    res.json({ notes });
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createNote = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const noteId = await createDashboardNote(teamId, { title, content, category });
    res.status(201).json({ message: 'Note created successfully', noteId });
  } catch (error) {
    console.error('Error in createNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    await updateDashboardNote(noteId, { title, content, category });
    res.json({ message: 'Note updated successfully' });
  } catch (error) {
    console.error('Error in updateNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    await deleteDashboardNote(noteId);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error in deleteNote:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote
};
```

---

## FILE: backend/controllers/teamController.js (getDashboard + updateSettings)

```js
const getDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await getPlayersByTeamId(teamId);
    const games = await getGamesByTeamId(teamId);
    const videos = await getVideosByTeamId(teamId);
    const practices = await getPracticesByTeamId(teamId);

  const activePlayers = players.filter(p => p.status === 'active').length;
  const injuredPlayers = players.filter(p => p.status === 'injured').length;
  
  const completedGames = games.filter(g => g.status === 'completed');
  const wins = completedGames.filter(g => g.team_score > g.opponent_score).length;
  const losses = completedGames.filter(g => g.team_score < g.opponent_score).length;
  const ties = completedGames.filter(g => g.team_score === g.opponent_score).length;
  
  const upcomingGames = games.filter(g => g.status === 'scheduled');
  const nextGame = upcomingGames.sort((a, b) => 
    new Date(a.game_date) - new Date(b.game_date)
  )[0] || null;

  const upcomingPractices = practices.sort((a, b) => 
    new Date(a.practice_date) - new Date(b.practice_date)
  );
  const nextPractice = upcomingPractices[0] || null;

    const dashboard = {
      team: {
        id: team.id,
        name: team.name,
        division: team.division,
        season: team.season
      },
      stats: {
        totalPlayers: players.length,
        activePlayers,
        injuredPlayers,
        totalGames: games.length,
        wins,
        losses,
        ties,
        upcomingGames: upcomingGames.length,
        totalVideos: videos.length,
        totalPractices: practices.length
      },
      nextGame,
      nextPractice
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, season, division } = req.body;
    await updateTeamSettings(teamId, { name, season, division });
    res.json({ message: 'Team settings updated successfully' });
  } catch (error) {
    console.error('Error in updateSettings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

## FILE: backend/models/dashboardNotesModel.js

```js
const { getDb, saveDb } = require('../db/database');
const { v4: uuidv4 } = require('uuid');

const getDashboardNotes = async (teamId) => {
  const db = await getDb();
  const result = db.exec(
    'SELECT * FROM dashboard_notes WHERE team_id = ? ORDER BY created_at DESC',
    [teamId]
  );
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const note = {};
    columns.forEach((col, i) => note[col] = row[i]);
    return note;
  });
};

const createDashboardNote = async (teamId, noteData) => {
  const db = await getDb();
  const noteId = uuidv4();
  const now = new Date().toISOString();
  
  db.run(
    `INSERT INTO dashboard_notes (id, team_id, title, content, category, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [noteId, teamId, noteData.title, noteData.content, noteData.category || null, now, now]
  );
  
  await saveDb();
  return noteId;
};

const updateDashboardNote = async (noteId, noteData) => {
  const db = await getDb();
  const now = new Date().toISOString();
  
  db.run(
    `UPDATE dashboard_notes 
     SET title = ?, content = ?, category = ?, updated_at = ? 
     WHERE id = ?`,
    [noteData.title, noteData.content, noteData.category || null, now, noteId]
  );
  
  await saveDb();
};

const deleteDashboardNote = async (noteId) => {
  const db = await getDb();
  db.run('DELETE FROM dashboard_notes WHERE id = ?', [noteId]);
  await saveDb();
};

module.exports = {
  getDashboardNotes,
  createDashboardNote,
  updateDashboardNote,
  deleteDashboardNote
};
```

---

## FILE: backend/models/teamModel.js (updateTeamSettings)

```js
const updateTeamSettings = async (teamId, settings) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  const updates = [];
  const values = [];
  
  if (settings.name !== undefined) {
    updates.push('name = ?');
    values.push(settings.name);
  }
  
  if (settings.season !== undefined) {
    updates.push('season = ?');
    values.push(settings.season);
  }
  
  if (settings.division !== undefined) {
    updates.push('division = ?');
    values.push(settings.division);
  }
  
  if (updates.length === 0) return;
  
  values.push(teamId);
  
  db.run(
    `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  await saveDb();
};
```

---

## FILE: backend/db/migrate.js (dashboard_notes table)

```sql
CREATE TABLE IF NOT EXISTS dashboard_notes (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
)
```

---

## FILE: backend/db/migrations/add_dashboard_notes.js

```js
const { getDb, saveDb } = require('../database');

async function up() {
  const db = await getDb();
  
  db.run(`
    CREATE TABLE IF NOT EXISTS dashboard_notes (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    )
  `);
  
  await saveDb();
  console.log('✅ Created dashboard_notes table');
}

async function down() {
  const db = await getDb();
  db.run('DROP TABLE IF EXISTS dashboard_notes');
  await saveDb();
  console.log('✅ Dropped dashboard_notes table');
}

module.exports = { up, down };
```

---

## Seed Data

**No dashboard_notes seed data exists** — the table starts empty. Notes are user-created at runtime.

---

## Architecture Notes

- **Dashboard data** is assembled in `teamController.getDashboard` by querying players, games, videos, and practices — it's a composite endpoint, not a dedicated dashboard model
- **DashboardNote** uses `snake_case` keys from DB (`team_id`, `created_at`) — not transformed to camelCase like other models
- **Recent Games section is a placeholder** — shows text "Click on Schedule or Games to record game results" instead of actual recent game data
- **`getDashboard` calculates wins/losses/ties** from completed games where `team_score > opponent_score` etc. — no separate stats table
- **`nextPractice`** is the first practice sorted by date — no filter for future-only (could show past practices)
- **Error/loading states** use light-mode styling (`bg-red-50`, `bg-yellow-50`) — doesn't match dark glass theme
- **Team settings edit** only allows name + season — division not exposed in the UI
- **Note categories** are hardcoded in the dropdown: Strategy, Defense, Offense, Special Teams, General
- **`updateTeamSettings` model** does a lazy `require` inside the function body (line 143) instead of at top of file
