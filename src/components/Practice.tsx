import { useState, useEffect } from 'react'
import { Clipboard, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { fetchPractices, Practice as PracticeType } from '../api/api'

interface PracticeProps {
  teamId: string
}

export default function Practice({ teamId }: PracticeProps) {
  const [practices, setPractices] = useState<PracticeType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null)

  useEffect(() => {
    loadPractices()
  }, [teamId])

  const loadPractices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchPractices(teamId)
      setPractices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practices')
      console.error('Error loading practices:', err)
    } finally {
      setLoading(false)
    }
  }

  const togglePractice = (practiceId: string) => {
    setExpandedPractice(expandedPractice === practiceId ? null : practiceId)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading practices...</p>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Practice Planner</h2>
          <p className="text-ice-200 mt-1">Schedule and organize team practices</p>
        </div>
      </div>

      {practices.length === 0 ? (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
          <Clipboard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No practices scheduled</h3>
          <p className="text-gray-600">Practice sessions will appear here once scheduled</p>
        </div>
      ) : (
        <div className="space-y-4">
          {practices.map((practice) => (
            <div key={practice.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => togglePractice(practice.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clipboard className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-semibold text-gray-900">{practice.focus}</h3>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(practice.practice_date).toLocaleDateString()} at {new Date(practice.practice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {practice.duration && (
                        <span>{practice.duration} minutes</span>
                      )}
                      {practice.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{practice.location}</span>
                        </div>
                      )}
                      <span className="text-blue-600 font-medium">{practice.drills.length} drills</span>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    {expandedPractice === practice.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {expandedPractice === practice.id && practice.drills.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Drill Plan</h4>
                  <div className="space-y-3">
                    {practice.drills.map((drill, index) => (
                      <div key={drill.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold text-gray-900">{drill.name}</h5>
                              {drill.duration && (
                                <span className="text-sm text-gray-600">{drill.duration} min</span>
                              )}
                            </div>
                            {drill.description && (
                              <p className="text-sm text-gray-600">{drill.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
