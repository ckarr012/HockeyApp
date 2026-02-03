import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, X, Film } from 'lucide-react'
import { fetchVideos, createVideo, Video } from '../api/api'

interface VideoLibraryProps {
  teamId: string
}

export default function VideoLibrary({ teamId }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [newVideoTitle, setNewVideoTitle] = useState('')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadVideos()
  }, [teamId])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchVideos(teamId)
      setVideos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
      console.error('Error loading videos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newVideoTitle.trim()) return

    try {
      setSubmitting(true)
      await createVideo(teamId, newVideoTitle, newVideoUrl || undefined)
      setNewVideoTitle('')
      setNewVideoUrl('')
      setShowModal(false)
      await loadVideos()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add video')
      console.error('Error adding video:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading videos...</p>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">Video Library</h2>
          <p className="text-ice-200 mt-1">Game film and highlight reels</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>

      {videos.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 p-12 text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Film className="w-20 h-20 text-ice-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">No videos yet</h3>
          <p className="text-ice-200 mb-6">Start building your video library by adding your first video</p>
          <motion.button 
            onClick={() => setShowModal(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add First Video</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {videos.map((video, index) => (
              <motion.div 
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="glass-strong rounded-xl shadow-xl border border-white/20 p-6 hover:shadow-glow-blue transition-all group"
              >
                <div className="flex flex-col space-y-4">
                  <motion.div 
                    className="relative w-full aspect-video bg-gradient-to-br from-ice-900 to-ice-700 rounded-lg flex items-center justify-center overflow-hidden group-hover:shadow-glow-blue transition-all"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <Play className="w-16 h-16 text-white relative z-10 group-hover:scale-110 transition-transform" />
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-ice-300 transition-colors">{video.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-ice-300 mb-3">
                      <Film className="w-4 h-4" />
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {video.url && (
                        <motion.a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold text-center shadow-lg hover:shadow-glow-blue transition-all"
                        >
                          ▶ Watch Video
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Video</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVideo}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    placeholder="e.g., College Power Play"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (YouTube/Vimeo)
                  </label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Video'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
