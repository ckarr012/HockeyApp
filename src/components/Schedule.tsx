import { Calendar as CalendarIcon } from 'lucide-react'

export default function Schedule() {
  const games = [
    { id: 1, date: 'Feb 15, 2026', time: '7:00 PM', opponent: 'Rival Rockets', location: 'Home Arena', type: 'home', status: 'upcoming' },
    { id: 2, date: 'Feb 18, 2026', time: '6:00 PM', opponent: 'Thunder Eagles', location: 'Eagles Arena', type: 'away', status: 'upcoming' },
    { id: 3, date: 'Feb 22, 2026', time: '7:30 PM', opponent: 'Storm Hawks', location: 'Home Arena', type: 'home', status: 'upcoming' },
    { id: 4, date: 'Feb 8, 2026', time: '7:00 PM', opponent: 'Thunder Bears', location: 'Home Arena', type: 'home', status: 'completed', score: '2-2 (OT)' },
    { id: 5, date: 'Feb 1, 2026', time: '6:30 PM', opponent: 'Storm Eagles', location: 'Eagles Arena', type: 'away', status: 'completed', score: '5-2 W' },
  ]

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
        {games.filter(g => g.status === 'upcoming').map((game) => (
          <div key={game.id} className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{game.date} • {game.time}</h3>
                  <p className="text-gray-600 mt-1">vs {game.opponent}</p>
                  <p className="text-sm text-gray-500 mt-1">{game.location}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.type === 'home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {game.type === 'home' ? '🏠 Home' : '🚌 Away'}
                </span>
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
                  <h3 className="text-lg font-semibold text-gray-900">{game.date} • {game.time}</h3>
                  <p className="text-gray-600 mt-1">vs {game.opponent}</p>
                  <p className="text-sm text-gray-500 mt-1">{game.location}</p>
                  <p className="text-sm font-medium text-green-600 mt-1">Final: {game.score}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  game.type === 'home' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {game.type === 'home' ? '🏠 Home' : '🚌 Away'}
                </span>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  Watch Video
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
