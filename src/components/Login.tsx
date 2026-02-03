import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Shield } from 'lucide-react'

interface LoginProps {
  onLogin: (user: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Username is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      onLogin(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (user: string) => {
    setUsername(user)
    setTimeout(() => {
      const form = document.querySelector('form')
      if (form) form.requestSubmit()
    }, 100)
  }

  return (
    <div className="min-h-screen bg-ice-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 ice-texture opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-ice-500 to-ice-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-blue"
          >
            <span className="text-4xl">🏒</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2 text-shadow">Hockey Coach Pro</h1>
          <p className="text-ice-200">Professional team management platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-ice-200 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-goal-500/30 rounded-lg p-3 bg-goal-500/10"
            >
              <p className="text-goal-300 text-sm font-semibold">{error}</p>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-ice-500 to-ice-600 text-white py-3 rounded-lg font-bold hover:shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </span>
            )}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-ice-400" />
            <p className="text-sm text-ice-300 font-semibold">Quick Demo Login:</p>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => quickLogin('Dad')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 glass hover:bg-white/20 rounded-lg text-sm font-semibold text-white transition-all border border-white/10"
            >
              <div className="font-bold">Coach Dad</div>
              <div className="text-xs text-ice-300 mt-1">College Wildcats</div>
            </motion.button>
            <motion.button
              onClick={() => quickLogin('Smith')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 glass hover:bg-white/20 rounded-lg text-sm font-semibold text-white transition-all border border-white/10"
            >
              <div className="font-bold">Coach Smith</div>
              <div className="text-xs text-ice-300 mt-1">Junior Rangers</div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
