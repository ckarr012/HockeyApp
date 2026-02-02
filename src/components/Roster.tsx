import { User } from 'lucide-react'

export default function Roster() {
  const players = [
    { id: 1, name: 'Connor Johnson', number: 13, position: 'C', shoots: 'L', gp: 25, g: 18, a: 22, pts: 40 },
    { id: 2, name: 'Jake Smith', number: 14, position: 'LW', shoots: 'L', gp: 25, g: 15, a: 18, pts: 33 },
    { id: 3, name: 'Ryan Williams', number: 7, position: 'RW', shoots: 'R', gp: 24, g: 12, a: 16, pts: 28 },
    { id: 4, name: 'Mike Anderson', number: 4, position: 'D', shoots: 'L', gp: 25, g: 3, a: 15, pts: 18 },
    { id: 5, name: 'Chris Taylor', number: 6, position: 'D', shoots: 'R', gp: 25, g: 5, a: 12, pts: 17 },
    { id: 6, name: 'Tom Jackson', number: 30, position: 'G', shoots: 'L', gp: 20, g: 0, a: 0, pts: 0 },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Team Roster</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          + Add Player
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 mb-6 p-4">
        <div className="flex items-center space-x-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>All Players</option>
            <option>Forwards</option>
            <option>Defense</option>
            <option>Goalies</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-lg">
            <option>Active</option>
            <option>Inactive</option>
            <option>Injured</option>
          </select>
          <input
            type="text"
            placeholder="Search players..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shoots</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">G</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">A</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">#{player.number}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{player.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{player.position}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.shoots}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{player.gp}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.g}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.a}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{player.pts}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
