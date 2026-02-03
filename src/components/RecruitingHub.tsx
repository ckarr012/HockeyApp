import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserPlus, Star, Phone, GraduationCap, TrendingUp, Eye, X, Save, Trash2, Video } from 'lucide-react'
import { fetchProspects, fetchProspectDetails, createProspect, updateProspect, deleteProspect, addProspectVideo, Prospect, ProspectVideo } from '../api/api'

interface RecruitingHubProps {
  teamId: string
}

type ProspectStatus = 'Watching' | 'Contacted' | 'Offered' | 'Committed'

export default function RecruitingHub({ teamId }: RecruitingHubProps) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [prospectVideos, setProspectVideos] = useState<ProspectVideo[]>([])

  // Form state
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [gradYear, setGradYear] = useState(2026)
  const [currentTeam, setCurrentTeam] = useState('')
  const [scoutRating, setScoutRating] = useState(3)
  const [contactInfo, setContactInfo] = useState('')
  const [status, setStatus] = useState<ProspectStatus>('Watching')
  const [coachingNotes, setCoachingNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Video form state
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    loadProspects()
  }, [teamId])

  const loadProspects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProspects(teamId)
      setProspects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prospects')
      console.error('Error loading prospects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (prospect: Prospect) => {
    try {
      const details = await fetchProspectDetails(prospect.id, teamId)
      setSelectedProspect(details.prospect)
      setProspectVideos(details.videos)
      setShowDetailModal(true)
    } catch (err) {
      alert('Failed to load prospect details')
      console.error('Error loading prospect details:', err)
    }
  }

  const resetForm = () => {
    setName('')
    setPosition('')
    setGradYear(2026)
    setCurrentTeam('')
    setScoutRating(3)
    setContactInfo('')
    setStatus('Watching')
    setCoachingNotes('')
  }

  const handleAddProspect = async () => {
    if (!name || !position) {
      alert('Name and position are required')
      return
    }

    try {
      setSaving(true)
      await createProspect(teamId, {
        name,
        position,
        gradYear,
        currentTeam,
        scoutRating,
        contactInfo,
        status,
        coachingNotes
      })
      await loadProspects()
      setShowAddForm(false)
      resetForm()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add prospect')
      console.error('Error adding prospect:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (prospect: Prospect, newStatus: ProspectStatus) => {
    try {
      await updateProspect(prospect.id, {
        ...prospect,
        teamId,
        status: newStatus
      })
      await loadProspects()
    } catch (err) {
      alert('Failed to update prospect status')
      console.error('Error updating status:', err)
    }
  }

  const handleDeleteProspect = async (prospectId: string) => {
    if (!confirm('Are you sure you want to delete this prospect?')) return

    try {
      await deleteProspect(prospectId, teamId)
      await loadProspects()
      setShowDetailModal(false)
    } catch (err) {
      alert('Failed to delete prospect')
      console.error('Error deleting prospect:', err)
    }
  }

  const handleAddVideo = async () => {
    if (!selectedProspect || !videoTitle || !videoUrl) {
      alert('Title and URL are required')
      return
    }

    try {
      await addProspectVideo(selectedProspect.id, teamId, { title: videoTitle, videoUrl })
      const details = await fetchProspectDetails(selectedProspect.id, teamId)
      setProspectVideos(details.videos)
      setVideoTitle('')
      setVideoUrl('')
      setShowVideoForm(false)
    } catch (err) {
      alert('Failed to add video')
      console.error('Error adding video:', err)
    }
  }

  const getProspectsByStatus = (status: ProspectStatus) => {
    return prospects.filter(p => p.status === status)
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  const statusColors = {
    Watching: 'bg-gray-100 border-gray-300',
    Contacted: 'bg-blue-50 border-blue-300',
    Offered: 'bg-purple-50 border-purple-300',
    Committed: 'bg-green-50 border-green-300'
  }

  const renderKanbanColumn = (status: ProspectStatus) => {
    const columnProspects = getProspectsByStatus(status)
    
    return (
      <div className="flex-1 min-w-[280px]">
        <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{status}</h3>
            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
              {columnProspects.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {columnProspects.map(prospect => (
              <div
                key={prospect.id}
                className={`p-4 rounded-lg border-2 ${statusColors[status]} hover:shadow-md transition-shadow cursor-pointer`}
                onClick={() => handleViewDetails(prospect)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{prospect.name}</h4>
                    <p className="text-sm text-gray-600">{prospect.position}</p>
                  </div>
                  {renderStars(prospect.scoutRating)}
                </div>
                
                {prospect.currentTeam && (
                  <p className="text-xs text-gray-500 mb-2">{prospect.currentTeam}</p>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center text-gray-500">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Class of {prospect.gradYear}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(prospect)
                    }}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>
                </div>
              </div>
            ))}
            
            {columnProspects.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No prospects in this stage
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recruiting pipeline...</p>
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Recruiting Hub</h2>
          <p className="text-ice-200 mt-1 text-lg">Track and manage your prospect pipeline</p>
        </div>
        <motion.button
          onClick={() => setShowAddForm(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Prospect</span>
        </motion.button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {renderKanbanColumn('Watching')}
        {renderKanbanColumn('Contacted')}
        {renderKanbanColumn('Offered')}
        {renderKanbanColumn('Committed')}
      </div>

      {/* Add Prospect Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Add New Prospect</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Player name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value="" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>Select position</option>
                    <option value="Center" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⚡ Center</option>
                    <option value="Left Wing" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>◀️ Left Wing</option>
                    <option value="Right Wing" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>▶️ Right Wing</option>
                    <option value="Defense" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>🛡️ Defense</option>
                    <option value="Goalie" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>🥅 Goalie</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={gradYear}
                    onChange={(e) => setGradYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scout Rating
                  </label>
                  <select
                    value={scoutRating}
                    onChange={(e) => setScoutRating(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value={1} style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⭐ (1 star)</option>
                    <option value={2} style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⭐⭐ (2 stars)</option>
                    <option value={3} style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⭐⭐⭐ (3 stars)</option>
                    <option value={4} style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⭐⭐⭐⭐ (4 stars)</option>
                    <option value={5} style={{ backgroundColor: '#f9fafb', color: '#111827' }}>⭐⭐⭐⭐⭐ (5 stars)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Team
                </label>
                <input
                  type="text"
                  value={currentTeam}
                  onChange={(e) => setCurrentTeam(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="High school or junior team"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Information
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email, phone, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProspectStatus)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                  style={{ colorScheme: 'light' }}
                >
                  <option value="Watching" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>👀 Watching</option>
                  <option value="Contacted" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>📞 Contacted</option>
                  <option value="Offered" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>💼 Offered</option>
                  <option value="Committed" style={{ backgroundColor: '#f9fafb', color: '#111827' }}>✅ Committed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coaching Notes
                </label>
                <textarea
                  value={coachingNotes}
                  onChange={(e) => setCoachingNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Scouting observations and evaluation notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddProspect}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Add Prospect'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Prospect Detail Modal */}
      {showDetailModal && selectedProspect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-start justify-between">
                <div className="text-white">
                  <h3 className="text-2xl font-bold">{selectedProspect.name}</h3>
                  <p className="text-blue-100 mt-1">
                    {selectedProspect.position} • Class of {selectedProspect.gradYear}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-blue-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recruitment Status
                  </label>
                  <select
                    value={selectedProspect.status}
                    onChange={(e) => handleUpdateStatus(selectedProspect, e.target.value as ProspectStatus)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    style={{ colorScheme: 'light' }}
                  >
                    <option value="Watching" style={{ backgroundColor: '#ffffff', color: '#111827' }}>👀 Watching</option>
                    <option value="Contacted" style={{ backgroundColor: '#ffffff', color: '#111827' }}>📞 Contacted</option>
                    <option value="Offered" style={{ backgroundColor: '#ffffff', color: '#111827' }}>💼 Offered</option>
                    <option value="Committed" style={{ backgroundColor: '#ffffff', color: '#111827' }}>✅ Committed</option>
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scout Rating
                  </label>
                  <div className="flex items-center">
                    {renderStars(selectedProspect.scoutRating)}
                    <span className="ml-2 text-sm text-gray-600">
                      ({selectedProspect.scoutRating}/5)
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {selectedProspect.currentTeam && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Team
                    </label>
                    <p className="text-gray-900">{selectedProspect.currentTeam}</p>
                  </div>
                )}
                
                {selectedProspect.contactInfo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      Contact Information
                    </label>
                    <p className="text-gray-900">{selectedProspect.contactInfo}</p>
                  </div>
                )}
              </div>

              {/* Coaching Notes */}
              {selectedProspect.coachingNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Coaching Notes & Evaluation
                  </label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedProspect.coachingNotes}</p>
                  </div>
                </div>
              )}

              {/* Video Gallery */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Video className="w-4 h-4 mr-1" />
                    Highlight Videos ({prospectVideos.length})
                  </label>
                  <button
                    onClick={() => setShowVideoForm(!showVideoForm)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Video
                  </button>
                </div>

                {showVideoForm && (
                  <div className="mb-4 bg-gray-50 rounded-lg p-4 space-y-3">
                    <input
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Video title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="YouTube/Vimeo URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleAddVideo}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Video
                    </button>
                  </div>
                )}

                {prospectVideos.length > 0 ? (
                  <div className="space-y-2">
                    {prospectVideos.map(video => (
                      <a
                        key={video.id}
                        href={video.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <Video className="w-5 h-5 text-red-600 mr-3" />
                          <span className="text-gray-900">{video.title}</span>
                        </div>
                        <span className="text-blue-600 text-sm">Watch →</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No videos added yet
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => handleDeleteProspect(selectedProspect.id)}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Prospect</span>
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
