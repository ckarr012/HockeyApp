import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Video, Users, Calendar, Clipboard, BarChart3, Activity, Search, UserPlus, Bell, Menu, LogOut, X, Layout, Layers, RefreshCw, Settings } from 'lucide-react'
import Dashboard from './components/Dashboard'
import VideoLibrary from './components/VideoLibrary'
import Roster from './components/Roster'
import Schedule from './components/Schedule'
import Practice from './components/Practice'
import Lineups from './components/Lineups'
import Stats from './components/Stats'
import TrainingRoom from './components/TrainingRoom'
import CalendarView from './components/CalendarView'
import ScoutingHub from './components/ScoutingHub'
import RecruitingHub from './components/RecruitingHub'
import AchaSyncModal from './components/AchaSyncModal'
import LoginV2 from './components/LoginV2'
import Register from './components/Register'
import AccountSettings from './components/AccountSettings'
import MFASetup from './components/MFASetup'

interface Account {
  id: string
  email: string
  username: string
  fullName: string
  phoneNumber?: string
  mfaEnabled: boolean
  teamId: string
  teamName: string
  division?: string
  season: string
  role?: string
}

function AppV2() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'))
  const [account, setAccount] = useState<Account | null>(() => {
    const stored = localStorage.getItem('account')
    return stored ? JSON.parse(stored) : null
  })
  const [showRegister, setShowRegister] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAchaSync, setShowAchaSync] = useState(false)

  const handleLogin = (authToken: string, accountData: Account) => {
    setToken(authToken)
    setAccount(accountData)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('account', JSON.stringify(accountData))
  }

  const handleRegisterSuccess = (authToken: string, accountData: Account) => {
    handleLogin(authToken, accountData)
    setShowRegister(false)
  }

  const handleLogout = () => {
    setToken(null)
    setAccount(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('account')
    setCurrentView('dashboard')
  }

  if (!token || !account) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setShowRegister(false)}
        />
      )
    }
    return (
      <LoginV2
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }

  const navigation = [
    { id: 'dashboard', name: 'Home', icon: Home },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'scouting', name: 'Scouting', icon: Search },
    { id: 'recruiting', name: 'Recruiting', icon: UserPlus },
    { id: 'videos', name: 'Video', icon: Video },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'lineups', name: 'Lineups', icon: Layers },
    { id: 'trainingroom', name: 'Training Room', icon: Activity },
    { id: 'games', name: 'Games', icon: Layout },
    { id: 'practice', name: 'Practice', icon: Clipboard },
    { id: 'stats', name: 'Stats', icon: BarChart3 },
  ]

  const teamId = account.teamId

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard teamId={teamId} onNavigate={setCurrentView} />
      case 'calendar':
        return <CalendarView teamId={teamId} />
      case 'scouting':
        return <ScoutingHub teamId={teamId} />
      case 'recruiting':
        return <RecruitingHub teamId={teamId} />
      case 'videos':
        return <VideoLibrary teamId={teamId} />
      case 'team':
        return <Roster teamId={teamId} />
      case 'lineups':
        return <Lineups teamId={teamId} />
      case 'trainingroom':
        return <TrainingRoom teamId={teamId} />
      case 'games':
        return <Schedule teamId={teamId} />
      case 'practice':
        return <Practice teamId={teamId} />
      case 'stats':
        return <Stats teamId={teamId} />
      default:
        return <Dashboard teamId={teamId} onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-ice-gradient">
      <header className="glass-strong border-b border-white/10 shadow-lg">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center shadow-glow-blue">
                <span className="text-2xl">🏒</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-shadow hidden sm:block">Hockey Coach Pro</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="glass px-3 py-2 rounded-lg border border-ice-500/30 hidden md:block">
              <span className="text-sm font-medium text-ice-200">{account.teamName}</span>
              <span className="text-xs text-ice-400 ml-2">• {account.season}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAchaSync(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold text-green-400 border border-green-500/30 bg-green-500/10 px-3 hidden sm:flex"
              title="Sync from ACHA"
            >
              <RefreshCw className="w-4 h-4" /> ACHA Sync
            </motion.button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-all relative hidden sm:block">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-goal-500 rounded-full animate-pulse"></span>
            </button>
            <div className="hidden lg:flex items-center space-x-2 glass px-3 py-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ice-500 to-ice-700 flex items-center justify-center text-sm font-bold shadow-glow-blue">
                {account.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm font-medium">{account.fullName}</span>
            </div>
            <button
              onClick={() => setShowAccountSettings(true)}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              title="Account Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-white/10 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <aside className="hidden lg:block w-64 glass-strong border-r border-white/10">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <motion.button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? 'bg-ice-500 text-white font-semibold shadow-glow-blue'
                      : 'text-ice-100 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.button>
              )
            })}
          </nav>
        </aside>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-white/10 z-50 lg:hidden"
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-lg font-bold">Navigation</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id)
                          setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          currentView === item.id
                            ? 'bg-ice-500 text-white font-semibold shadow-glow-blue'
                            : 'text-ice-100 hover:bg-white/10'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-lg">{item.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-auto">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderView()}
          </motion.div>
        </main>
      </div>

      <AchaSyncModal
        teamId={teamId}
        isOpen={showAchaSync}
        onClose={() => setShowAchaSync(false)}
        onSyncComplete={(destination) => {
          setShowAchaSync(false)
          if (destination === 'scouting') setCurrentView('scouting')
          else if (destination === 'team') setCurrentView('team')
        }}
      />

      {showAccountSettings && (
        <AccountSettings
          token={token}
          account={account}
          onClose={() => setShowAccountSettings(false)}
        />
      )}

      {showMFASetup && (
        <MFASetup
          token={token}
          onComplete={() => setShowMFASetup(false)}
          onCancel={() => setShowMFASetup(false)}
        />
      )}
    </div>
  )
}

export default AppV2
