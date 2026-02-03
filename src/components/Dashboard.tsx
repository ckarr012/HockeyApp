import { useState, useEffect } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'
import { fetchDashboard, DashboardData } from '../api/api'

interface DashboardProps {
  teamId: string
}

export default function Dashboard({ teamId }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchDashboard(teamId)
        setDashboardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [teamId])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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

  const pinnedNotes = [
    { title: 'Defensive Zone Coverage Issues', category: 'Defense' },
    { title: 'Special Teams Improvements', category: 'Strategy' },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Welcome back, Coach</h2>
        <p className="text-ice-200 mt-1 text-lg">{team.name} • {team.season}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Games Played</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalGames}</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-3xl font-bold text-green-600">{winRate}%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Record</p>
              <p className="text-3xl font-bold text-gray-900">{stats.wins}-{stats.losses}-{stats.ties}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Game */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Next Game</h3>
          </div>
          <div className="p-6">
            {nextGame ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(nextGame.gameDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {nextGame.opponent}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(nextGame.gameDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {nextGame.location}
                  </p>
                </div>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  nextGame.homeAway === 'home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {nextGame.homeAway === 'home' ? 'Home' : 'Away'}
                </span>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming games scheduled</p>
            )}
          </div>
        </div>

        {/* Team Stats */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Team Overview</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Total Players</span>
              <span className="font-medium text-gray-900">{stats.totalPlayers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-sm text-gray-600">Active</span>
              <span className="font-medium text-green-700">{stats.activePlayers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="text-sm text-gray-600">Injured</span>
              <span className="font-medium text-red-700">{stats.injuredPlayers}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-sm text-gray-600">Videos</span>
              <span className="font-medium text-blue-700">{stats.totalVideos}</span>
            </div>
          </div>
        </div>

        {/* Pinned Notes */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pinned Notes</h3>
          </div>
          <div className="p-6 space-y-3">
            {pinnedNotes.map((note, index) => (
              <div key={index} className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <div className="flex items-start">
                  <span className="text-xl mr-2">📌</span>
                  <div>
                    <p className="font-medium text-gray-900">{note.title}</p>
                    <p className="text-sm text-gray-600">{note.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Schedule */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Next Practice</h3>
          </div>
          <div className="p-6">
            {nextPractice ? (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="font-medium text-gray-900">
                  {new Date(nextPractice.practiceDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                  {new Date(nextPractice.practiceDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-600">{nextPractice.focus}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No upcoming practices scheduled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
