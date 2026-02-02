import { useState } from 'react'
import { Home, Video, Users, Calendar, FileText, Clipboard, BarChart3, Bell, Menu } from 'lucide-react'
import Dashboard from './components/Dashboard'
import VideoLibrary from './components/VideoLibrary'
import Roster from './components/Roster'
import Schedule from './components/Schedule'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigation = [
    { id: 'dashboard', name: 'Home', icon: Home },
    { id: 'videos', name: 'Video', icon: Video },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'games', name: 'Games', icon: Calendar },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'practice', name: 'Practice', icon: Clipboard },
    { id: 'stats', name: 'Stats', icon: BarChart3 },
  ]

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'videos':
        return <VideoLibrary />
      case 'team':
        return <Roster />
      case 'games':
        return <Schedule />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:bg-blue-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">🏒 Hockey Coach App</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select className="bg-blue-800 text-white px-3 py-1 rounded border border-blue-700">
              <option>Thunder U18 AAA</option>
              <option>Lightning U16</option>
            </select>
            <button className="p-2 rounded hover:bg-blue-800 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold">
                CS
              </div>
              <span className="text-sm">Coach Smith</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
            <nav className="p-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-blue-50 text-blue-900 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App
