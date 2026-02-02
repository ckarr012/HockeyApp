import { useState, useEffect } from 'react'
import { CalendarIcon, ClipboardList, FileText } from 'lucide-react'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading games...</p>
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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Game Schedule</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Add Game
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Games</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Locations</option>
            <option>Home</option>
            <option>Away</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Upcoming Games</h3>
        {games.filter(g => g.status === 'scheduled').map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{formatGameDate(game.gameDate)} • {formatGameTime(game.gameDate)}</h3>
                  <p className="text-gray-600 mt-1">vs {game.opponent}</p>
                  <p className="text-sm text-gray-500 mt-1">{game.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.homeAway === 'home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {game.homeAway === 'home' ? '🏠 Home' : '🚌 Away'}
                </span>
                {scoutingReports[game.id] && (
                  <a
                    href="#/scouting"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>View Scouting Report</span>
                  </a>
                )}
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}

        <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-8">Recent Games</h3>
        {games.filter(g => g.status === 'completed').map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{formatGameDate(game.gameDate)} • {formatGameTime(game.gameDate)}</h3>
                  <p className="text-gray-600 mt-1">vs {game.opponent}</p>
                  <p className="text-sm text-gray-500 mt-1">{game.location}</p>
                  {formatScore(game) && (
                    <p className="text-sm font-medium text-green-600 mt-1">Final: {formatScore(game)}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.homeAway === 'home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {game.homeAway === 'home' ? '🏠 Home' : '🚌 Away'}
                </span>
                <button
                  onClick={() => handleRecordStats(game)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center space-x-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Record Stats</span>
                </button>
              </div>
            </div>
          </div>
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
