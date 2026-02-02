import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, Video as VideoIcon, Users } from 'lucide-react'
import { fetchCalendar, CalendarEvent } from '../api/api'
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
        <div
          key={currentDay.toString()}
          className={`min-h-[120px] border border-gray-200 p-2 ${
            !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
          } ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-semibold mb-2 ${
            !isCurrentMonth ? 'text-gray-400' : isTodayDate ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {format(currentDay, 'd')}
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className={`w-full text-left px-2 py-1 rounded text-xs font-medium transition-colors ${getEventColor(event.type)} ${getEventTextColor()}`}
              >
                <div className="truncate">{event.title}</div>
              </button>
            ))}
          </div>
        </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-3xl font-bold text-gray-900">Team Calendar</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-lg font-semibold text-gray-700 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Games</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Practices</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-700 font-medium">Film Sessions</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="px-2 py-3 text-center text-sm font-semibold text-gray-700">
              {day}
            </div>
          ))}
        </div>
        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className={`px-6 py-4 ${getEventColor(selectedEvent.type)} ${getEventTextColor()} rounded-t-lg flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                {getEventIcon(selectedEvent.type)}
                <div>
                  <div className="text-xs uppercase font-semibold opacity-90">
                    {selectedEvent.type}
                  </div>
                  <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setShowQuickView(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500 font-medium">Date & Time</div>
                  <div className="text-gray-900">{formatEventDate(selectedEvent.date)}</div>
                </div>
              </div>

              {selectedEvent.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Location</div>
                    <div className="text-gray-900">{selectedEvent.location}</div>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'game' && (
                <>
                  {selectedEvent.opponent && (
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500 font-medium">Opponent</div>
                        <div className="text-gray-900">{selectedEvent.opponent}</div>
                      </div>
                    </div>
                  )}
                  {selectedEvent.homeAway && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-500 font-medium">Game Type</div>
                        <div className="text-gray-900 capitalize">
                          {selectedEvent.homeAway === 'home' ? '🏠 Home' : '🚌 Away'}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedEvent.status === 'completed' && selectedEvent.teamScore !== null && selectedEvent.opponentScore !== null && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-500 font-medium mb-1">Final Score</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {selectedEvent.teamScore} - {selectedEvent.opponentScore}
                      </div>
                    </div>
                  )}
                </>
              )}

              {selectedEvent.type === 'practice' && selectedEvent.focus && (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Focus</div>
                    <div className="text-gray-900">{selectedEvent.focus}</div>
                  </div>
                </div>
              )}

              {selectedEvent.type === 'film' && selectedEvent.url && (
                <div className="flex items-start space-x-3">
                  <VideoIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500 font-medium">Video</div>
                    <a 
                      href={selectedEvent.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Watch Video
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
              <button
                onClick={() => setShowQuickView(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
