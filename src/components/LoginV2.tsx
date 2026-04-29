import { useState } from 'react'
import { motion } from 'framer-motion'
import { LogIn, Lock, User, Shield } from 'lucide-react'

interface LoginV2Props {
  onLogin: (token: string, account: any) => void
  onShowRegister: () => void
}

export default function LoginV2({ onLogin, onShowRegister }: LoginV2Props) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaMethod, setMfaMethod] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!identifier.trim() || !password.trim()) {
      setError('Email/username and password are required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/v2/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      if (data.mfa_required) {
        setMfaRequired(true)
        setMfaMethod(data.mfa_method)
        setAccountId(data.account_id)
        
        if (data.mfa_method === 'sms') {
          await sendSMSCode(data.account_id)
        }
      } else {
        onLogin(data.token, data.account)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const sendSMSCode = async (accId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/v2/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: accId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send SMS code')
      }

      if (data.devMode && data.devCode) {
        setDevCode(data.devCode)
      } else {
        setDevCode(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS code')
    }
  }

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mfaCode.trim()) {
      setError('Verification code is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/v2/verify-mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          accountId, 
          code: mfaCode.trim(),
          useBackup: useBackupCode
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      onLogin(data.token, data.account)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendSMS = async () => {
    if (!accountId) return
    setError(null)
    await sendSMSCode(accountId)
  }

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-ice-gradient flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 ice-texture opacity-20"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-ice-500 to-ice-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-blue"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2 text-shadow">Verify Identity</h1>
            <p className="text-ice-200">
              {mfaMethod === 'sms' 
                ? 'Enter the code sent to your phone' 
                : 'Enter code from your authenticator app'}
            </p>
          </div>

          {devCode && (
            <div className="mb-6 glass border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/10">
              <p className="text-yellow-300 text-xs font-semibold mb-1">DEV MODE (Twilio not configured)</p>
              <p className="text-white text-sm mb-2">Your verification code:</p>
              <code className="text-yellow-200 text-2xl font-mono font-bold tracking-widest">{devCode}</code>
            </div>
          )}

          <form onSubmit={handleMFAVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-ice-200 mb-2">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
                placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
                maxLength={useBackupCode ? 8 : 6}
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
              {loading ? 'Verifying...' : 'Verify'}
            </motion.button>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="w-full text-sm text-ice-300 hover:text-white transition-colors"
              >
                {useBackupCode ? 'Use verification code' : 'Use backup code'}
              </button>
              
              {mfaMethod === 'sms' && !useBackupCode && (
                <button
                  type="button"
                  onClick={handleResendSMS}
                  className="w-full text-sm text-ice-300 hover:text-white transition-colors"
                >
                  Resend SMS code
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMfaRequired(false)
                  setMfaCode('')
                  setError(null)
                }}
                className="w-full text-sm text-ice-300 hover:text-white transition-colors"
              >
                Back to login
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )
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

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-bold text-ice-200 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="Enter your email or username"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-ice-200 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 focus:border-ice-500 transition-all"
              placeholder="Enter your password"
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

        <div className="mt-6 text-center">
          <button
            onClick={onShowRegister}
            className="text-ice-300 hover:text-white transition-colors text-sm font-semibold"
          >
            Don't have an account? <span className="text-ice-400">Register here</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
