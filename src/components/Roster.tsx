import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { fetchPlayers, Player } from '../api/api'
import LoadingSpinner from './LoadingSpinner'

interface RosterProps {
  teamId: string
}

export default function Roster({ teamId }: RosterProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchPlayers(teamId)
        setPlayers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load players')
        console.error('Error loading players:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [teamId])

  if (loading) return <LoadingSpinner message="Loading roster..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="glass-strong border border-goal-500/30 rounded-lg p-6 bg-goal-500/10">
          <p className="text-goal-300 font-semibold text-lg">Error loading roster</p>
          <p className="text-goal-200 text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Team Roster</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Add Player
          </button>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <p className="text-yellow-800 font-medium">No players found</p>
          <p className="text-yellow-600 text-sm mt-1">Add players to build your roster</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Team Roster</h2>
          <p className="text-ice-200 mt-1">{players.length} players</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all"
        >
          + Add Player
        </motion.button>
      </div>

      <div className="glass-strong rounded-lg mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <select 
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>👥 All Players</option>
            <option value="forwards" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>⚡ Forwards</option>
            <option value="defense" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>🛡️ Defense</option>
            <option value="goalies" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>🥅 Goalies</option>
          </select>
          <select 
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
            style={{ colorScheme: 'dark' }}
          >
            <option value="active" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✓ Active</option>
            <option value="inactive" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>○ Inactive</option>
            <option value="injured" style={{ backgroundColor: '#1e3a5f', color: 'white' }}>✕ Injured</option>
          </select>
          <input
            type="text"
            placeholder="Search players..."
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
          />
        </div>
      </div>

      <div className="glass-strong rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">#</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Player</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden md:table-cell">Position</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden lg:table-cell">Shoots</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden xl:table-cell">Height</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider hidden xl:table-cell">Weight</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {players.map((player, index) => (
                <motion.tr 
                  key={player.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-ice-200">#{player.jerseyNumber}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center mr-3 shadow-glow-blue group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-white">{player.firstName} {player.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <span className="px-2 py-1 text-xs font-bold bg-ice-500/30 text-ice-200 rounded border border-ice-500/50 uppercase">{player.position}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-ice-200 uppercase hidden lg:table-cell">{player.shoots}</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-ice-200 hidden xl:table-cell">{player.height} cm</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-ice-200 hidden xl:table-cell">{player.weight} kg</td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${
                      player.status === 'active' 
                        ? 'status-active' 
                        : player.status === 'injured'
                        ? 'status-injured'
                        : 'status-day-to-day'
                    }`}>
                      {player.status.charAt(0).toUpperCase() + player.status.slice(1).replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-ice-400 hover:text-ice-200 font-semibold transition-colors">View</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
