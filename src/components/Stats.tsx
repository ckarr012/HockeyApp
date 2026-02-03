import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Trophy, Award } from 'lucide-react'
import { fetchTeamStats, PlayerStats } from '../api/api'

interface StatsProps {
  teamId: string
}

export default function Stats({ teamId }: StatsProps) {
  const [stats, setStats] = useState<PlayerStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [teamId])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTeamStats(teamId)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
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
          <p className="text-ice-200 text-lg">Loading stats...</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Season Statistics</h2>
          <p className="text-ice-200 text-lg">Player performance & team analytics</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2 glass-strong px-6 py-3 rounded-lg border border-white/20 shadow-lg"
        >
          <Trophy className="w-5 h-5 text-ice-400" />
          <span className="font-bold text-white text-lg">{stats.length} Players</span>
        </motion.div>
      </motion.div>

      {stats.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-20 h-20 text-ice-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">No stats recorded yet</h3>
          <p className="text-ice-200">Record game stats to see player performance data</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-ice-300 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">GP</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">G</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">A</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider bg-ice-500/20">PTS</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">SOG</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">BLK</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-ice-300 uppercase tracking-wider">PIM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stats.map((player, index) => {
                  const isTopThree = index < 3
                  const rankColors = [
                    'from-yellow-500/30 to-amber-500/30 border-l-4 border-yellow-400',
                    'from-gray-400/30 to-gray-500/30 border-l-4 border-gray-400',
                    'from-orange-500/30 to-amber-700/30 border-l-4 border-orange-500'
                  ]
                  return (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className={`${isTopThree ? `bg-gradient-to-r ${rankColors[index]}` : ''} cursor-pointer transition-all`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}><Trophy className="w-5 h-5 text-yellow-400 mr-2" /></motion.div>}
                          {index === 1 && <Award className="w-5 h-5 text-gray-400 mr-2" />}
                          {index === 2 && <Award className="w-5 h-5 text-orange-400 mr-2" />}
                          <span className="text-sm font-bold text-white">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-ice-500 to-ice-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-lg">
                            {player.jersey_number}
                          </div>
                          <div className="text-sm font-bold text-white">
                            {player.first_name} {player.last_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-ice-200 font-medium capitalize">{player.position.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-semibold">
                        {player.games_played}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">
                        {player.total_goals}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-white font-bold">
                        {player.total_assists}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm bg-ice-500/20">
                        <motion.span
                          whileHover={{ scale: 1.2 }}
                          className="inline-block font-black text-ice-300 text-xl"
                        >
                          {player.total_points}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_shots}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_blocks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-ice-200 font-medium">
                        {player.total_pims}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
