import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Download, RefreshCw, X } from 'lucide-react'
import MFASetup from './MFASetup'

interface AccountSettingsProps {
  token: string
  account: any
  onClose: () => void
}

export default function AccountSettings({ token, account, onClose }: AccountSettingsProps) {
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  useEffect(() => {
    if (account.mfaEnabled) {
      fetchBackupCodes()
    }
  }, [account.mfaEnabled])

  const fetchBackupCodes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/v2/mfa/backup-codes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBackupCodes(data.backupCodes || [])
      }
    } catch (err) {
      console.error('Failed to fetch backup codes:', err)
    }
  }

  const handleDisableMFA = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/v2/mfa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable MFA')
      }

      window.location.reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/v2/mfa/regenerate-backup-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to regenerate backup codes')
      }

      setBackupCodes(data.backupCodes)
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to regenerate codes')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const text = backupCodes.join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hockey-coach-pro-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Account Settings</h2>
            <button
              onClick={onClose}
              className="text-ice-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-ice-400 text-sm">Email:</span>
                  <p className="text-white">{account.email}</p>
                </div>
                <div>
                  <span className="text-ice-400 text-sm">Username:</span>
                  <p className="text-white">{account.username}</p>
                </div>
                <div>
                  <span className="text-ice-400 text-sm">Full Name:</span>
                  <p className="text-white">{account.fullName}</p>
                </div>
                {account.phoneNumber && (
                  <div>
                    <span className="text-ice-400 text-sm">Phone:</span>
                    <p className="text-white">{account.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-ice-400" />
                <h3 className="text-lg font-bold text-white">Two-Factor Authentication</h3>
              </div>

              {account.mfaEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white font-semibold">MFA is enabled</span>
                  </div>

                  {backupCodes.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Backup Codes ({backupCodes.length} remaining)</h4>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {backupCodes.map((code, i) => (
                          <code key={i} className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded">
                            {code}
                          </code>
                        ))}
                      </div>
                      <button
                        onClick={downloadBackupCodes}
                        className="flex items-center gap-2 glass hover:bg-white/20 rounded-lg px-4 py-2 text-ice-300 hover:text-white transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download Codes
                      </button>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div>
                      <label className="block text-sm text-ice-300 mb-2">
                        Enter password to regenerate backup codes or disable MFA
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:ring-2 focus:ring-ice-500 transition-all"
                        placeholder="Your password"
                      />
                    </div>

                    {error && (
                      <div className="glass border border-goal-500/30 rounded-lg p-3 bg-goal-500/10">
                        <p className="text-goal-300 text-sm font-semibold">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={handleRegenerateBackupCodes}
                        disabled={loading || !password}
                        className="flex items-center gap-2 glass hover:bg-white/20 rounded-lg px-4 py-2 text-ice-300 hover:text-white transition-all disabled:opacity-50 text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate Codes
                      </button>

                      {!showDisableConfirm ? (
                        <button
                          onClick={() => setShowDisableConfirm(true)}
                          disabled={loading || !password}
                          className="glass hover:bg-goal-500/20 rounded-lg px-4 py-2 text-goal-300 hover:text-goal-200 transition-all disabled:opacity-50 text-sm border border-goal-500/30"
                        >
                          Disable MFA
                        </button>
                      ) : (
                        <button
                          onClick={handleDisableMFA}
                          disabled={loading}
                          className="bg-goal-500 hover:bg-goal-600 rounded-lg px-4 py-2 text-white transition-all disabled:opacity-50 text-sm font-semibold"
                        >
                          Confirm Disable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-white">MFA is not enabled</span>
                  </div>
                  <p className="text-ice-300 text-sm">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button
                    onClick={() => setShowMFASetup(true)}
                    className="bg-gradient-to-r from-ice-500 to-ice-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-glow-blue transition-all"
                  >
                    Enable MFA
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {showMFASetup && (
        <MFASetup
          token={token}
          onComplete={() => {
            setShowMFASetup(false)
            window.location.reload()
          }}
          onCancel={() => setShowMFASetup(false)}
        />
      )}
    </>
  )
}
