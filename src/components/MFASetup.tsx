import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Smartphone, QrCode, Download, Check } from 'lucide-react'

interface MFASetupProps {
  token: string
  onComplete: () => void
  onCancel: () => void
}

export default function MFASetup({ token, onComplete, onCancel }: MFASetupProps) {
  const [method, setMethod] = useState<'totp' | 'sms' | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'choose' | 'setup' | 'verify' | 'complete'>('choose')
  const [devCode, setDevCode] = useState<string | null>(null)

  const startEnrollment = async (selectedMethod: 'totp' | 'sms') => {
    try {
      setLoading(true)
      setError(null)
      setMethod(selectedMethod)

      const response = await fetch('http://localhost:5000/api/auth/v2/mfa/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ method: selectedMethod })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start MFA enrollment')
      }

      if (selectedMethod === 'totp') {
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else if (selectedMethod === 'sms' && data.devMode) {
        setDevCode(data.devCode)
      }

      setStep('setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start enrollment')
    } finally {
      setLoading(false)
    }
  }

  const completeEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim()) {
      setError('Verification code is required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:5000/api/auth/v2/mfa/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          method,
          code: verificationCode.trim(),
          secret: secret || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setBackupCodes(data.backupCodes)
      setStep('complete')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
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

  if (step === 'choose') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-ice-500 to-ice-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Enable Two-Factor Authentication</h2>
            <p className="text-ice-300 text-sm">Add an extra layer of security to your account</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => startEnrollment('totp')}
              disabled={loading}
              className="w-full glass hover:bg-white/20 rounded-lg p-4 transition-all border border-white/10 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ice-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-6 h-6 text-ice-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Authenticator App</h3>
                  <p className="text-ice-300 text-sm">Use Google Authenticator, Authy, or similar apps</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startEnrollment('sms')}
              disabled={loading}
              className="w-full glass hover:bg-white/20 rounded-lg p-4 transition-all border border-white/10 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-ice-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-ice-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">SMS Text Message</h3>
                  <p className="text-ice-300 text-sm">Receive codes via text message</p>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <div className="mt-4 glass border border-goal-500/30 rounded-lg p-3 bg-goal-500/10">
              <p className="text-goal-300 text-sm font-semibold">{error}</p>
            </div>
          )}

          <button
            onClick={onCancel}
            className="w-full mt-6 text-ice-300 hover:text-white transition-colors text-sm font-semibold"
          >
            Maybe later
          </button>
        </motion.div>
      </div>
    )
  }

  if (step === 'setup' && method === 'totp') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Scan QR Code</h2>

          {qrCode && (
            <div className="bg-white p-4 rounded-lg mb-4">
              <img src={qrCode} alt="QR Code" className="w-full" />
            </div>
          )}

          <div className="glass rounded-lg p-4 mb-6">
            <p className="text-ice-300 text-sm mb-2">Manual entry key:</p>
            <code className="text-white font-mono text-xs break-all">{secret}</code>
          </div>

          <form onSubmit={completeEnrollment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-ice-200 mb-2">
                Enter 6-digit code from your app
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-ice-400 focus:ring-2 focus:ring-ice-500 transition-all"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="glass border border-goal-500/30 rounded-lg p-3 bg-goal-500/10">
                <p className="text-goal-300 text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ice-500 to-ice-600 text-white py-3 rounded-lg font-bold hover:shadow-glow-blue transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-ice-300 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (step === 'setup' && method === 'sms') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Verify Phone Number</h2>

          <p className="text-ice-300 text-center mb-4">
            We've sent a verification code to your phone number.
          </p>

          {devCode && (
            <div className="mb-6 glass border border-yellow-500/30 rounded-lg p-4 bg-yellow-500/10">
              <p className="text-yellow-300 text-xs font-semibold mb-1">DEV MODE (Twilio not configured)</p>
              <p className="text-white text-sm mb-2">Your verification code:</p>
              <code className="text-yellow-200 text-2xl font-mono font-bold tracking-widest">{devCode}</code>
            </div>
          )}

          <form onSubmit={completeEnrollment} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-ice-200 mb-2">
                Enter 6-digit code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder-ice-400 focus:ring-2 focus:ring-ice-500 transition-all"
                placeholder="000000"
                maxLength={6}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="glass border border-goal-500/30 rounded-lg p-3 bg-goal-500/10">
                <p className="text-goal-300 text-sm font-semibold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ice-500 to-ice-600 text-white py-3 rounded-lg font-bold hover:shadow-glow-blue transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full text-ice-300 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">MFA Enabled!</h2>
            <p className="text-ice-300 text-sm">Your account is now more secure</p>
          </div>

          <div className="glass rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-ice-400" />
              <h3 className="text-white font-bold">Backup Codes</h3>
            </div>
            <p className="text-ice-300 text-sm mb-4">
              Save these codes in a safe place. Each can be used once if you lose access to your device.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {backupCodes.map((code, i) => (
                <code key={i} className="text-white font-mono text-sm bg-white/5 px-3 py-2 rounded">
                  {code}
                </code>
              ))}
            </div>
            <button
              onClick={downloadBackupCodes}
              className="w-full flex items-center justify-center gap-2 glass hover:bg-white/20 rounded-lg py-2 text-ice-300 hover:text-white transition-all"
            >
              <Download className="w-4 h-4" />
              Download Codes
            </button>
          </div>

          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-ice-500 to-ice-600 text-white py-3 rounded-lg font-bold hover:shadow-glow-blue transition-all"
          >
            Done
          </button>
        </motion.div>
      </div>
    )
  }

  return null
}
