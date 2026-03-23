# Hockey App — Games/Calendar Code Dump
Copy everything below and paste into Claude.

---

## FILE: src/components/CalendarView.tsx
(This is the main games/schedule UI — there is no separate Games.tsx)

```tsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Video as VideoIcon, Users, Save, Trash2 } from 'lucide-react'
import { fetchCalendar, createGame, createPractice, createVideo, deletePractice, deleteGame, deleteVideo, CalendarEvent } from '../api/api'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO
} from 'date-fns'

interface CalendarViewProps {
  teamId: string
}

export default function CalendarView({ teamId }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [eventType, setEventType] = useState<'game' | 'practice' | 'film'>('game')
  
  // Form state for new event
  const [eventDate, setEventDate] = useState('')
  const [opponent, setOpponent] = useState('')
  const [location, setLocation] = useState('')
  const [homeAway, setHomeAway] = useState<'home' | 'away'>('home')
  const [practiceFocus, setPracticeFocus] = useState('')
  const [duration, setDuration] = useState(60)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    loadEvents()
  }, [teamId])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchCalendar(teamId)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load calendar')
      console.error('Error loading calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowQuickView(true)
  }

  const handleAddEvent = async () => {
    try {
      setSaving(true)
      
      if (eventType === 'game') {
        if (!eventDate || !opponent || !location) {
          alert('Please fill in all fields')
          return
        }
        await createGame(teamId, {
          game_date: new Date(eventDate).toISOString(),
          opponent,
          location,
          home_away: homeAway,
          status: 'scheduled'
        })
      } else if (eventType === 'practice') {
        if (!eventDate || !practiceFocus || !location) {
          alert('Please fill in all fields')
          return
        }
        await createPractice(teamId, {
          practice_date: new Date(eventDate).toISOString(),
          focus: practiceFocus,
          duration,
          location,
          drills: []
        })
      } else if (eventType === 'film') {
        if (!videoTitle || !videoUrl) {
          alert('Please fill in all fields')
          return
        }
        await createVideo(teamId, videoTitle, videoUrl)
      }
      
      // Reset form
      setEventDate('')
      setOpponent('')
      setLocation('')
      setHomeAway('home')
      setPracticeFocus('')
      setDuration(60)
      setVideoTitle('')
      setVideoUrl('')
      setShowAddEventModal(false)
      
      // Reload calendar
      await loadEvents()
    } catch (err) {
      console.error('Error creating event:', err)
      alert('Failed to create event')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    if (!confirm(`Are you sure you want to delete this ${event.type}?`)) return
    
    try {
      if (event.type === 'practice') {
        await deletePractice(event.id)
      } else if (event.type === 'game') {
        await deleteGame(event.id)
      } else if (event.type === 'film') {
        await deleteVideo(event.id)
      }
      
      await loadEvents()
      setShowQuickView(false)
    } catch (err) {
      console.error('Error deleting event:', err)
      alert('Failed to delete event')
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'game':
        return 'bg-green-500 hover:bg-green-600'
      case 'practice':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'film':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getEventTextColor = () => {
    return 'text-white'
  }

  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = parseISO(event.date)
      return isSameDay(eventDate, day)
    })
  }

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = []
    let day = startDate

    while (day <= endDate) {
      const currentDay = day
      const dayEvents = getEventsForDay(currentDay)
      const isCurrentMonth = isSameMonth(currentDay, currentDate)
      const isTodayDate = isToday(currentDay)

      days.push(
        <motion.div
          key={currentDay.toString()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.01 * days.length }}
          whileHover={{ scale: 1.02 }}
          className={`min-h-[120px] border border-white/10 p-2 transition-all ${
            !isCurrentMonth ? 'bg-white/5' : 'bg-white/10'
          } ${isTodayDate ? 'ring-2 ring-ice-500 bg-ice-500/20' : ''}`}
        >
          <div className={`text-sm font-bold mb-2 ${
            !isCurrentMonth ? 'text-ice-400' : isTodayDate ? 'text-ice-300' : 'text-white'
          }`}>
            {format(currentDay, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <motion.button
                key={event.id}
                onClick={() => handleEventClick(event)}
                whileHover={{ scale: 1.05, x: 2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full text-left px-2 py-1 rounded text-xs font-bold transition-all ${getEventColor(event.type)} ${getEventTextColor()} shadow-md`}
              >
                <div className="truncate">{event.title}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )
      day = addDays(day, 1)
    }

    return days
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'game':
        return <Users className="w-5 h-5" />
      case 'practice':
        return <Clock className="w-5 h-5" />
      case 'film':
        return <VideoIcon className="w-5 h-5" />
      default:
        return null
    }
  }

  const formatEventDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'EEEE, MMMM d, yyyy • h:mm a')
    } catch {
      return dateString
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
          <p className="text-ice-200 text-lg">Loading calendar...</p>
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
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Team Calendar</h2>
          <p className="text-ice-200 text-lg">Games, practices & team events</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 glass-strong px-4 py-2 rounded-lg border border-white/20">
            <motion.button
              onClick={handlePreviousMonth}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-ice-300" />
            </motion.button>
            <span className="text-lg font-bold text-white min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <motion.button
              onClick={handleNextMonth}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-ice-300" />
            </motion.button>
          </div>
        </div>
        <motion.button
          onClick={() => setShowAddEventModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Event</span>
        </motion.button>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center space-x-6 mb-6 glass-strong rounded-xl shadow-xl border border-white/20 p-4"
      >
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.2 }} className="w-4 h-4 bg-green-500 rounded shadow-lg"></motion.div>
          <span className="text-sm text-ice-200 font-bold">Games</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.2 }} className="w-4 h-4 bg-blue-500 rounded shadow-lg"></motion.div>
          <span className="text-sm text-ice-200 font-bold">Practices</span>
        </div>
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.2 }} className="w-4 h-4 bg-red-500 rounded shadow-lg"></motion.div>
          <span className="text-sm text-ice-200 font-bold">Film Sessions</span>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
      >
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-white/5 border-b border-white/10">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="px-2 py-4 text-center text-sm font-bold text-ice-300 uppercase tracking-wider"
            >
              {day}
            </motion.div>
          ))}
        </div>
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden"
            >
              {/* Modal Header */}
              <div className={`px-6 py-5 ${getEventColor(selectedEvent.type)} ${getEventTextColor()} flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                  {getEventIcon(selectedEvent.type)}
                  <div>
                    <div className="text-xs uppercase font-bold opacity-90 tracking-wider">
                      {selectedEvent.type}
                    </div>
                    <h3 className="text-2xl font-black">{selectedEvent.title}</h3>
                  </div>
                </div>
                <motion.button
                  onClick={() => setShowQuickView(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 bg-white/5">
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-ice-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-ice-300 font-bold">Date & Time</div>
                    <div className="text-white font-semibold">{formatEventDate(selectedEvent.date)}</div>
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-ice-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-ice-300 font-bold">Location</div>
                      <div className="text-white font-semibold">{selectedEvent.location}</div>
                    </div>
                  </div>
                )}

                {selectedEvent.type === 'game' && (
                  <>
                    {selectedEvent.opponent && (
                      <div className="flex items-start space-x-3">
                        <Users className="w-5 h-5 text-ice-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-ice-300 font-bold">Opponent</div>
                          <div className="text-white font-semibold">{selectedEvent.opponent}</div>
                        </div>
                      </div>
                    )}
                    {selectedEvent.homeAway && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-ice-400 mt-0.5" />
                        <div>
                          <div className="text-sm text-ice-300 font-bold">Game Type</div>
                          <div className="text-white font-semibold capitalize">
                            {selectedEvent.homeAway === 'home' ? '🏠 Home' : '✈️ Away'}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedEvent.status === 'completed' && selectedEvent.teamScore !== null && selectedEvent.opponentScore !== null && (
                      <div className="bg-gradient-to-r from-ice-500/20 to-green-500/20 rounded-lg p-4 border border-ice-500/30">
                        <div className="text-sm text-ice-300 font-bold mb-2">Final Score</div>
                        <div className="text-3xl font-black text-white">
                          {selectedEvent.teamScore} - {selectedEvent.opponentScore}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {selectedEvent.type === 'practice' && selectedEvent.focus && (
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-ice-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-ice-300 font-bold">Focus</div>
                      <div className="text-white font-semibold">{selectedEvent.focus}</div>
                    </div>
                  </div>
                )}

                {selectedEvent.type === 'film' && selectedEvent.url && (
                  <div className="flex items-start space-x-3">
                    <VideoIcon className="w-5 h-5 text-ice-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-ice-300 font-bold">Video</div>
                      <a 
                        href={selectedEvent.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-ice-400 hover:text-ice-300 underline font-semibold"
                      >
                        Watch Video
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowQuickView(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue transition-all"
                >
                  View Details
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteEvent(selectedEvent)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold shadow-lg transition-all flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEventModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddEventModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-lg w-full border border-white/20 overflow-hidden"
            >
              <div className="px-6 py-5 bg-ice-500 flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Add New Event</h3>
                <motion.button
                  onClick={() => setShowAddEventModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Event Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      onClick={() => setEventType('game')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-3 rounded-lg font-bold transition-all ${
                        eventType === 'game'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-white/10 text-ice-300 hover:bg-white/20'
                      }`}
                    >
                      🏒 Game
                    </motion.button>
                    <motion.button
                      onClick={() => setEventType('practice')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-3 rounded-lg font-bold transition-all ${
                        eventType === 'practice'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white/10 text-ice-300 hover:bg-white/20'
                      }`}
                    >
                      ⚡ Practice
                    </motion.button>
                    <motion.button
                      onClick={() => setEventType('film')}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-3 rounded-lg font-bold transition-all ${
                        eventType === 'film'
                          ? 'bg-red-500 text-white shadow-lg'
                          : 'bg-white/10 text-ice-300 hover:bg-white/20'
                      }`}
                    >
                      🎥 Film
                    </motion.button>
                  </div>
                </div>

                {eventType !== 'film' && (
                  <div>
                    <label className="block text-sm font-bold text-ice-200 mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                    />
                  </div>
                )}

                {eventType === 'game' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Opponent</label>
                      <input
                        type="text"
                        value={opponent}
                        onChange={(e) => setOpponent(e.target.value)}
                        placeholder="e.g., State University Bears"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Main Ice Arena"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Home/Away</label>
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => setHomeAway('home')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                            homeAway === 'home'
                              ? 'bg-ice-500 text-white shadow-glow-blue'
                              : 'bg-white/10 text-ice-300 hover:bg-white/20'
                          }`}
                        >
                          🏠 Home
                        </motion.button>
                        <motion.button
                          onClick={() => setHomeAway('away')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                            homeAway === 'away'
                              ? 'bg-ice-500 text-white shadow-glow-blue'
                              : 'bg-white/10 text-ice-300 hover:bg-white/20'
                          }`}
                        >
                          ✈️ Away
                        </motion.button>
                      </div>
                    </div>
                  </>
                )}

                {eventType === 'practice' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Practice Focus</label>
                      <input
                        type="text"
                        value={practiceFocus}
                        onChange={(e) => setPracticeFocus(e.target.value)}
                        placeholder="e.g., Power Play Development"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-ice-200 mb-2">Duration (min)</label>
                        <input
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-ice-200 mb-2">Location</label>
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Main Rink"
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {eventType === 'film' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Film Title</label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="e.g., Game vs State - Defensive Breakdown"
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-ice-200 mb-2">Video URL</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="e.g., https://youtube.com/watch?v=..."
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowAddEventModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleAddEvent}
                  disabled={saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Creating...' : `Add ${eventType === 'game' ? 'Game' : eventType === 'practice' ? 'Practice' : 'Film Session'}`}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

---

## FILE: src/api/api.ts (game/calendar-related types and functions only)

```ts
export interface Game {
  id: string;
  teamId: string;
  opponent: string;
  gameDate: string;
  location: string;
  homeAway: string;
  status: string;
  teamScore: number | null;
  opponentScore: number | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'game' | 'practice' | 'film';
  location?: string;
  homeAway?: string;
  status?: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  opponent?: string;
  focus?: string;
  duration?: number;
  url?: string;
  gameId?: string;
}

export async function fetchGames(teamId: string): Promise<Game[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`);
  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.statusText}`);
  }
  const data = await response.json();
  return data.games;
}

export async function createGame(teamId: string, gameData: {
  game_date: string;
  opponent: string;
  location: string;
  home_away: string;
  status?: string;
}): Promise<{ gameId: string }> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameData),
  });
  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }
  return response.json();
}

export async function updateGameScore(gameId: string, teamScore: number, opponentScore: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}/score`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ teamScore, opponentScore }),
  });
  if (!response.ok) {
    throw new Error(`Failed to update game score: ${response.statusText}`);
  }
}

export async function deleteGame(gameId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teams/games/${gameId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete game: ${response.statusText}`);
  }
}

export async function fetchCalendar(teamId: string): Promise<CalendarEvent[]> {
  const response = await fetch(`${API_BASE_URL}/teams/${teamId}/calendar`);
  if (!response.ok) {
    throw new Error(`Failed to fetch calendar: ${response.statusText}`);
  }
  const data = await response.json();
  return data.events;
}
```

---

## FILE: backend/routes/teamRoutes.js (game routes live here)

```js
const express = require('express');
const router = express.Router();
const { getPlayers, addPlayer, getDashboard, getGames, addGame, updateScore, removeGame, removeVideo, updateSettings } = require('../controllers/teamController');

router.get('/:teamId/players', getPlayers);
router.post('/:teamId/players', addPlayer);

router.get('/:teamId/dashboard', getDashboard);

router.get('/:teamId/games', getGames);
router.post('/:teamId/games', addGame);
router.put('/games/:gameId/score', updateScore);
router.delete('/games/:gameId', removeGame);
router.delete('/videos/:videoId', removeVideo);

router.put('/:teamId/settings', updateSettings);

module.exports = router;
```

---

## FILE: backend/routes/calendarRoutes.js

```js
const express = require('express');
const router = express.Router();
const { getCalendar } = require('../controllers/calendarController');

router.get('/:teamId/calendar', getCalendar);

module.exports = router;
```

---

## FILE: backend/controllers/teamController.js (game-related methods)

```js
const {
  getTeamById,
  getPlayersByTeamId,
  getGamesByTeamId,
  getVideosByTeamId,
  getPracticesByTeamId,
  createGame,
  updateGameScore,
  deleteGame,
  deleteVideo,
  updateTeamSettings
} = require('../models/teamModel');
const { createPlayer } = require('../models/playerModel');

const getGames = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const games = await getGamesByTeamId(teamId);
    
    res.json({ games });
  } catch (error) {
    console.error('Error in getGames:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const addGame = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { game_date, opponent, location, home_away, status } = req.body;
    
    const gameId = await createGame(teamId, {
      game_date,
      opponent,
      location,
      home_away,
      status
    });
    
    res.status(201).json({ message: 'Game created successfully', gameId });
  } catch (error) {
    console.error('Error in addGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateScore = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { teamScore, opponentScore } = req.body;
    
    await updateGameScore(gameId, teamScore, opponentScore);
    
    res.json({ message: 'Score updated successfully' });
  } catch (error) {
    console.error('Error in updateScore:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const removeGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    await deleteGame(gameId);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Error in removeGame:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const players = await getPlayersByTeamId(teamId);
    const games = await getGamesByTeamId(teamId);
    const videos = await getVideosByTeamId(teamId);
    const practices = await getPracticesByTeamId(teamId);

    const activePlayers = players.filter(p => p.status === 'active').length;
    const injuredPlayers = players.filter(p => p.status === 'injured').length;
    
    const completedGames = games.filter(g => g.status === 'completed');
    const wins = completedGames.filter(g => g.teamScore > g.opponentScore).length;
    const losses = completedGames.filter(g => g.teamScore < g.opponentScore).length;
    const ties = completedGames.filter(g => g.teamScore === g.opponentScore).length;
    
    const upcomingGames = games.filter(g => g.status === 'scheduled');
    const nextGame = upcomingGames.sort((a, b) => 
      new Date(a.gameDate) - new Date(b.gameDate)
    )[0] || null;

    const upcomingPractices = practices.sort((a, b) => 
      new Date(a.practice_date) - new Date(b.practice_date)
    );
    const nextPractice = upcomingPractices[0] || null;

    const dashboard = {
      team: {
        id: team.id,
        name: team.name,
        division: team.division,
        season: team.season
      },
      stats: {
        totalPlayers: players.length,
        activePlayers,
        injuredPlayers,
        totalGames: games.length,
        wins,
        losses,
        ties,
        upcomingGames: upcomingGames.length,
        totalVideos: videos.length,
        totalPractices: practices.length
      },
      nextGame,
      nextPractice
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error in getDashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPlayers,
  addPlayer,
  getDashboard,
  getGames,
  addGame,
  updateScore,
  removeGame,
  removeVideo,
  updateSettings
};
```

---

## FILE: backend/controllers/calendarController.js

```js
const { getCalendarEvents } = require('../models/calendarModel');
const { getTeamById } = require('../models/teamModel');

const getCalendar = async (req, res) => {
  try {
    const { teamId } = req.params;
    
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const events = await getCalendarEvents(teamId);
    
    res.json({ events });
  } catch (error) {
    console.error('Error in getCalendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCalendar
};
```

---

## FILE: backend/models/teamModel.js (game-related model functions)

```js
const { getDb } = require('../db/database');

const getGamesByTeamId = async (teamId) => {
  const db = await getDb();
  const result = db.exec('SELECT * FROM games WHERE team_id = ?', [teamId]);
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const game = {};
    columns.forEach((col, i) => game[col] = row[i]);
    // Transform to camelCase for frontend
    return {
      id: game.id,
      teamId: game.team_id,
      opponent: game.opponent,
      gameDate: game.game_date,
      location: game.location,
      homeAway: game.home_away,
      status: game.status,
      teamScore: game.team_score,
      opponentScore: game.opponent_score,
      createdAt: game.created_at,
      updatedAt: game.updated_at
    };
  });
};

const createGame = async (teamId, gameData) => {
  const { getDb, saveDb } = require('../db/database');
  const { v4: uuidv4 } = require('uuid');
  
  const db = await getDb();
  const gameId = uuidv4();
  
  db.run(
    `INSERT INTO games (id, team_id, game_date, opponent, location, home_away, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [gameId, teamId, gameData.game_date, gameData.opponent, gameData.location, gameData.home_away, gameData.status || 'scheduled']
  );
  
  await saveDb();
  return gameId;
};

const updateGameScore = async (gameId, teamScore, opponentScore) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run(
    'UPDATE games SET team_score = ?, opponent_score = ?, status = ? WHERE id = ?',
    [teamScore, opponentScore, 'completed', gameId]
  );
  
  await saveDb();
};

const deleteGame = async (gameId) => {
  const { getDb, saveDb } = require('../db/database');
  const db = await getDb();
  
  db.run('DELETE FROM games WHERE id = ?', [gameId]);
  
  await saveDb();
};
```

---

## FILE: backend/models/calendarModel.js

```js
const { getDb } = require('../db/database');

const getCalendarEvents = async (teamId) => {
  const db = await getDb();
  
  // Fetch games
  const gamesResult = db.exec('SELECT * FROM games WHERE team_id = ?', [teamId]);
  const games = gamesResult.length > 0 
    ? gamesResult[0].values.map(row => {
        const game = {};
        gamesResult[0].columns.forEach((col, i) => game[col] = row[i]);
        return {
          id: game.id,
          title: `vs ${game.opponent}`,
          date: game.game_date,
          type: 'game',
          location: game.location,
          homeAway: game.home_away,
          status: game.status,
          teamScore: game.team_score,
          opponentScore: game.opponent_score,
          opponent: game.opponent
        };
      })
    : [];

  // Fetch practices
  const practicesResult = db.exec('SELECT * FROM practices WHERE team_id = ?', [teamId]);
  const practices = practicesResult.length > 0
    ? practicesResult[0].values.map(row => {
        const practice = {};
        practicesResult[0].columns.forEach((col, i) => practice[col] = row[i]);
        return {
          id: practice.id,
          title: practice.focus || 'Practice',
          date: practice.practice_date,
          type: 'practice',
          focus: practice.focus,
          duration: practice.duration,
          location: practice.location
        };
      })
    : [];

  // Fetch videos (film sessions)
  const videosResult = db.exec('SELECT * FROM videos WHERE team_id = ?', [teamId]);
  const videos = videosResult.length > 0
    ? videosResult[0].values.map(row => {
        const video = {};
        videosResult[0].columns.forEach((col, i) => video[col] = row[i]);
        return {
          id: video.id,
          title: video.title,
          date: video.created_at,
          type: 'film',
          url: video.url,
          gameId: video.game_id
        };
      })
    : [];

  // Combine and sort by date
  const allEvents = [...games, ...practices, ...videos].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );

  return allEvents;
};

module.exports = {
  getCalendarEvents
};
```

---

## FILE: backend/db/migrate.js (games table only)

```sql
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  opponent TEXT NOT NULL,
  game_date DATETIME NOT NULL,
  location TEXT NOT NULL,
  home_away TEXT NOT NULL,
  status TEXT DEFAULT 'scheduled',
  team_score INTEGER,
  opponent_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id)
)
```

---

## FILE: backend/db/seed.js (game seed data only)

```js
const gameA1Id = uuidv4();
const gameA2Id = uuidv4();
const gameA3Id = uuidv4();
const gameB1Id = uuidv4();
const gameB2Id = uuidv4();
const gameB3Id = uuidv4();

const gamesTeamA = [
  {
    id: gameA1Id,
    team_id: teamAId,
    opponent: 'State University Bears',
    game_date: '2026-02-10T19:00:00Z',
    location: 'Home Arena',
    home_away: 'home',
    status: 'scheduled',
    team_score: null,
    opponent_score: null
  },
  {
    id: gameA2Id,
    team_id: teamAId,
    opponent: 'Tech College Titans',
    game_date: '2026-02-03T18:00:00Z',
    location: 'Tech Arena',
    home_away: 'away',
    status: 'completed',
    team_score: 4,
    opponent_score: 2
  },
  {
    id: gameA3Id,
    team_id: teamAId,
    opponent: 'Regional College Eagles',
    game_date: '2026-01-28T19:30:00Z',
    location: 'Home Arena',
    home_away: 'home',
    status: 'completed',
    team_score: 3,
    opponent_score: 3
  }
];

const gamesTeamB = [
  {
    id: gameB1Id,
    team_id: teamBId,
    opponent: 'Thunder Hawks',
    game_date: '2026-02-08T18:30:00Z',
    location: 'Rangers Arena',
    home_away: 'home',
    status: 'scheduled',
    team_score: null,
    opponent_score: null
  },
  {
    id: gameB2Id,
    team_id: teamBId,
    opponent: 'Lightning Bolts',
    game_date: '2026-02-01T19:00:00Z',
    location: 'Bolts Arena',
    home_away: 'away',
    status: 'completed',
    team_score: 5,
    opponent_score: 3
  },
  {
    id: gameB3Id,
    team_id: teamBId,
    opponent: 'Storm Eagles',
    game_date: '2026-01-25T18:00:00Z',
    location: 'Rangers Arena',
    home_away: 'home',
    status: 'completed',
    team_score: 2,
    opponent_score: 4
  }
];
```

---

## Architecture Notes

- **No separate Games.tsx** — games are managed through `CalendarView.tsx` which shows games, practices, and film sessions on a monthly calendar grid
- **Game routes live in `teamRoutes.js`** alongside player and dashboard routes, not in a separate file
- **Game model functions live in `teamModel.js`** — `getGamesByTeamId`, `createGame`, `updateGameScore`, `deleteGame`
- **Calendar is a unified view** — `calendarModel.js` fetches games + practices + videos, merges them into `CalendarEvent[]` sorted by date
- **`StatsEntryModal`** is opened from the game detail view (or schedule) and links to a specific `gameId`
- **Game statuses**: `scheduled` or `completed` (set to `completed` when score is recorded via `updateGameScore`)
