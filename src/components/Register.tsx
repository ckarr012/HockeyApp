import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Mail, User, Lock, Phone, ArrowLeft } from 'lucide-react'

interface RegisterProps {
  onRegisterSuccess: (token: string, account: any) => void
  onBackToLogin: () => void
}

export default function Register({ onRegisterSuccess, onBackToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    return strength
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      setLoading(true)

      const response = await fetch('http://localhost:5000/api/auth/v2/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      onRegisterSuccess(data.token, data.account)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-goal-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
  }

  return (
    <div className="min-h-screen bg-ice-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 ice-texture opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20"
      >
        <button
          onClick={onBackToLogin}
          className="flex items-center gap-2 text-ice-300 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-ice-500 to-ice-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-blue"
          >
            <UserPlus className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2 text-shadow">Create Account</h1>
          <p className="text-ice-200">Join Hockey Coach Pro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="username"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number (Optional - for SMS MFA)
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="+1 (555) 123-4567"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="••••••••"
              required
              disabled={loading}
            />
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-ice-300">{getStrengthText()}</span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-ice-200 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="••••••••"
              required
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}
