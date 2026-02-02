import { Calendar, Video, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const upcomingGames = [
    { date: 'Feb 15', opponent: 'Rival Rockets', time: '7:00 PM', location: 'Home' },
    { date: 'Feb 18', opponent: 'Thunder Eagles', time: '6:00 PM', location: 'Away' },
    { date: 'Feb 22', opponent: 'Storm Hawks', time: '7:30 PM', location: 'Home' },
  ]

  const recentVideos = [
    { title: 'Full Game vs Bears', date: 'Feb 8, 2026', duration: '58:30', tags: 12 },
    { title: 'Practice - Power Play', date: 'Feb 10, 2026', duration: '45:00', tags: 8 },
  ]

  const pinnedNotes = [
    { title: 'Defensive Zone Coverage Issues', category: 'Defense' },
    { title: 'Special Teams Improvements', category: 'Strategy' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, Coach Smith</h2>
        <p className="text-gray-600 mt-1">Thunder U18 AAA • 2025-2026 Season</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Games Played</p>
              <p className="text-3xl font-bold text-gray-900">25</p>
            </div>
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-3xl font-bold text-green-600">67%</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Goals/Game</p>
              <p className="text-3xl font-bold text-gray-900">3.8</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Games */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Games</h3>
          </div>
          <div className="p-6 space-y-4">
            {upcomingGames.map((game, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{game.date} - {game.opponent}</p>
                  <p className="text-sm text-gray-600">{game.time} • {game.location}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  game.location === 'Home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {game.location}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Videos</h3>
          </div>
          <div className="p-6 space-y-4">
            {recentVideos.map((video, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-24 h-16 bg-gradient-to-br from-blue-900 to-blue-700 rounded flex items-center justify-center flex-shrink-0">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{video.title}</p>
                  <p className="text-sm text-gray-600">{video.date} • {video.duration}</p>
                  <p className="text-xs text-gray-500 mt-1">{video.tags} tags</p>
                </div>
              </div>
            ))}
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
            <h3 className="text-lg font-semibold text-gray-900">Practice Schedule</h3>
          </div>
          <div className="p-6 space-y-3">
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="font-medium text-gray-900">Tomorrow • 5:00 PM</p>
              <p className="text-sm text-gray-600">Power Play Practice • Main Arena</p>
              <p className="text-xs text-gray-500 mt-1">90 min • 8 drills</p>
            </div>
            <div className="p-4 bg-gray-50 border-l-4 border-gray-300 rounded">
              <p className="font-medium text-gray-900">Feb 12 • 5:00 PM</p>
              <p className="text-sm text-gray-600">Defensive Zone Coverage • Main Arena</p>
              <p className="text-xs text-gray-500 mt-1">90 min • 6 drills</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
