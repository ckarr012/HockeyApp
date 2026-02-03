import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, ClipboardList, FileText, Trophy } from 'lucide-react'
import { fetchGames, fetchScoutingReportByGame, Game } from '../api/api'
import StatsEntryModal from './StatsEntryModal'

interface ScheduleProps {
  teamId: string
}

export default function Schedule({ teamId }: ScheduleProps) {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [scoutingReports, setScoutingReports] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    loadGames()
  }, [teamId])

  const loadGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const gamesData = await fetchGames(teamId)
      setGames(gamesData)
      
      // Check for scouting reports on scheduled games
      const reportChecks: {[key: string]: boolean} = {}
      for (const game of gamesData.filter(g => g.status === 'scheduled')) {
        try {
          const report = await fetchScoutingReportByGame(game.id, teamId)
          reportChecks[game.id] = report !== null
        } catch {
          reportChecks[game.id] = false
        }
      }
      setScoutingReports(reportChecks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games')
      console.error('Error loading games:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordStats = (game: Game) => {
    setSelectedGame(game)
    setShowStatsModal(true)
  }

  const handleStatsSuccess = () => {
    loadGames()
  }

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatGameTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  const formatScore = (game: Game) => {
    if (!game.teamScore && game.teamScore !== 0) return null
    return `${game.teamScore}-${game.opponentScore}`
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
          <p className="text-ice-200 text-lg">Loading games...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Game Schedule</h2>
          <p className="text-ice-200 text-lg">Manage your game calendar</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue hover:shadow-xl transition-all"
        >
          + Add Game
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-xl shadow-xl border border-white/20 mb-6 p-4"
      >
        <div className="flex items-center gap-4">
          <select 
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>📅 All Games</option>
            <option value="upcoming" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>⏰ Upcoming</option>
            <option value="completed" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✓ Completed</option>
          </select>
          <select 
            className="px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>📍 All Locations</option>
            <option value="home" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>🏠 Home</option>
            <option value="away" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✈️ Away</option>
          </select>
        </div>
      </motion.div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-2 text-ice-400" />
          Upcoming Games
        </h3>
        {games.filter(g => g.status === 'scheduled').map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-strong rounded-xl shadow-2xl border border-white/20 p-6 hover:shadow-glow-blue transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-ice-500 to-ice-600 flex items-center justify-center shadow-lg"
                >
                  <CalendarIcon className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white">{formatGameDate(game.gameDate)} • {formatGameTime(game.gameDate)}</h3>
                  <p className="text-ice-200 mt-1 font-semibold text-lg">vs {game.opponent}</p>
                  <p className="text-sm text-ice-300 mt-1">{game.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  game.homeAway === 'home' 
                    ? 'bg-ice-500 text-white shadow-glow-blue' 
                    : 'bg-white/20 text-ice-200'
                }`}>
                  {game.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}
                </span>
                {scoutingReports[game.id] && (
                  <motion.a
                    href="#/scouting"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Scouting Report</span>
                  </motion.a>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors font-semibold"
                >
                  View Details
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        <h3 className="text-2xl font-bold text-white mb-4 mt-8 flex items-center">
          <Trophy className="w-6 h-6 mr-2 text-green-400" />
          Recent Games
        </h3>
        {games.filter(g => g.status === 'completed').map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-strong rounded-xl shadow-2xl border border-white/20 p-6 hover:shadow-glow-green transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -10 }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg"
                >
                  <Trophy className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold text-white">{formatGameDate(game.gameDate)} • {formatGameTime(game.gameDate)}</h3>
                  <p className="text-ice-200 mt-1 font-semibold text-lg">vs {game.opponent}</p>
                  <p className="text-sm text-ice-300 mt-1">{game.location}</p>
                  {formatScore(game) && (
                    <p className="text-sm font-bold text-green-400 mt-2">Final: {formatScore(game)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  game.homeAway === 'home' 
                    ? 'bg-ice-500 text-white shadow-glow-blue' 
                    : 'bg-white/20 text-ice-200'
                }`}>
                  {game.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}
                </span>
                <motion.button
                  onClick={() => handleRecordStats(game)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Record Stats</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Entry Modal */}
      {showStatsModal && selectedGame && (
        <StatsEntryModal
          gameId={selectedGame.id}
          teamId={teamId}
          gameName={`vs ${selectedGame.opponent} - ${formatGameDate(selectedGame.gameDate)}`}
          onClose={() => setShowStatsModal(false)}
          onSuccess={handleStatsSuccess}
        />
      )}
    </div>
  )
}
