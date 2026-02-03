import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clipboard, Clock, MapPin, ChevronDown, ChevronUp, Zap, Plus, Trash2, X } from 'lucide-react'
import { fetchPractices, createPractice, deletePractice, Practice as PracticeType } from '../api/api'

interface PracticeProps {
  teamId: string
}

interface DrillInput {
  name: string;
  duration: number;
  description: string;
}

export default function Practice({ teamId }: PracticeProps) {
  const [practices, setPractices] = useState<PracticeType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPractice, setExpandedPractice] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [practiceDate, setPracticeDate] = useState('')
  const [practiceFocus, setPracticeFocus] = useState('')
  const [practiceDuration, setPracticeDuration] = useState(60)
  const [practiceLocation, setPracticeLocation] = useState('')
  const [drills, setDrills] = useState<DrillInput[]>([{ name: '', duration: 15, description: '' }])

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

  const handleAddDrill = () => {
    setDrills([...drills, { name: '', duration: 15, description: '' }])
  }

  const handleRemoveDrill = (index: number) => {
    setDrills(drills.filter((_, i) => i !== index))
  }

  const handleDrillChange = (index: number, field: keyof DrillInput, value: string | number) => {
    const newDrills = [...drills]
    newDrills[index] = { ...newDrills[index], [field]: value }
    setDrills(newDrills)
  }

  const handleCreatePractice = async () => {
    try {
      setCreating(true)
      await createPractice(teamId, {
        practice_date: new Date(practiceDate).toISOString(),
        focus: practiceFocus,
        duration: practiceDuration,
        location: practiceLocation,
        drills: drills.filter(d => d.name.trim() !== '')
      })
      
      // Reset form
      setPracticeDate('')
      setPracticeFocus('')
      setPracticeDuration(60)
      setPracticeLocation('')
      setDrills([{ name: '', duration: 15, description: '' }])
      setShowCreateModal(false)
      
      // Reload practices
      await loadPractices()
    } catch (err) {
      console.error('Error creating practice:', err)
      alert('Failed to create practice')
    } finally {
      setCreating(false)
    }
  }

  const handleDeletePractice = async (practiceId: string) => {
    if (!confirm('Are you sure you want to delete this practice?')) return
    
    try {
      await deletePractice(practiceId)
      await loadPractices()
    } catch (err) {
      console.error('Error deleting practice:', err)
      alert('Failed to delete practice')
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
          <p className="text-ice-200 text-lg">Loading practices...</p>
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow mb-2">Practice Planner</h2>
          <p className="text-ice-200 text-lg">Schedule and organize team practices</p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Practice</span>
        </motion.button>
      </motion.div>

      {practices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-strong rounded-xl shadow-2xl border border-white/20 p-12 text-center"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clipboard className="w-20 h-20 text-ice-400 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">No practices scheduled</h3>
          <p className="text-ice-200">Practice sessions will appear here once scheduled</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {practices.map((practice, practiceIndex) => (
            <motion.div
              key={practice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: practiceIndex * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-strong rounded-xl shadow-2xl border border-white/20 overflow-hidden"
            >
              <motion.div 
                className="p-6"
              >
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer hover:bg-white/5 transition-colors rounded-lg p-2 -m-2"
                    onClick={() => togglePractice(practice.id)}
                  >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clipboard className="w-6 h-6 text-ice-400" />
                      <h3 className="text-2xl font-bold text-white">{practice.focus}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-ice-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-ice-400" />
                        <span className="font-medium">{new Date(practice.practice_date).toLocaleDateString()} at {new Date(practice.practice_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {practice.duration && (
                        <span className="px-3 py-1 bg-ice-500/20 rounded-full font-semibold">{practice.duration} min</span>
                      )}
                      {practice.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-ice-400" />
                          <span className="font-medium">{practice.location}</span>
                        </div>
                      )}
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full font-bold flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>{practice.drills.length} drills</span>
                      </span>
                    </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePractice(practice.id)
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    >
                      <Trash2 className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                    </motion.button>
                    <motion.button
                      onClick={() => togglePractice(practice.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {expandedPractice === practice.id ? (
                        <ChevronUp className="w-6 h-6 text-ice-300" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-ice-300" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {expandedPractice === practice.id && practice.drills.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-white/10 bg-white/5 overflow-hidden"
                  >
                    <div className="p-6">
                      <h4 className="text-sm font-bold text-ice-300 mb-4 uppercase tracking-wider flex items-center">
                        <Zap className="w-4 h-4 mr-2" />
                        Drill Plan
                      </h4>
                      <div className="space-y-3">
                        {practice.drills.map((drill, index) => (
                          <motion.div
                            key={drill.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ x: 4, scale: 1.02 }}
                            className="glass rounded-lg p-4 border border-white/10 hover:border-ice-500/50 transition-all"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-ice-500 to-ice-600 text-white rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 shadow-lg">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-bold text-white text-lg">{drill.name}</h5>
                                  {drill.duration && (
                                    <span className="px-3 py-1 bg-ice-500/30 text-ice-200 rounded-full text-sm font-bold">{drill.duration} min</span>
                                  )}
                                </div>
                                {drill.description && (
                                  <p className="text-sm text-ice-200 leading-relaxed">{drill.description}</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Practice Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong rounded-xl shadow-2xl max-w-2xl w-full border border-white/20 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-5 bg-ice-500 flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">Create New Practice</h3>
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={practiceDate}
                    onChange={(e) => setPracticeDate(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ice-200 mb-2">Focus</label>
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
                      value={practiceDuration}
                      onChange={(e) => setPracticeDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-ice-200 mb-2">Location</label>
                    <input
                      type="text"
                      value={practiceLocation}
                      onChange={(e) => setPracticeLocation(e.target.value)}
                      placeholder="e.g., Main Ice Rink"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-ice-400" />
                      Drills
                    </h4>
                    <motion.button
                      onClick={handleAddDrill}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-white/10 text-ice-200 rounded-lg font-semibold hover:bg-white/20 transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Drill</span>
                    </motion.button>
                  </div>

                  <div className="space-y-3">
                    {drills.map((drill, index) => (
                      <div key={index} className="glass rounded-lg p-4 border border-white/10">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-ice-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={drill.name}
                              onChange={(e) => handleDrillChange(index, 'name', e.target.value)}
                              placeholder="Drill name"
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all text-sm"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <input
                                type="number"
                                value={drill.duration}
                                onChange={(e) => handleDrillChange(index, 'duration', parseInt(e.target.value))}
                                placeholder="Duration"
                                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all text-sm"
                              />
                              <input
                                type="text"
                                value={drill.description}
                                onChange={(e) => handleDrillChange(index, 'description', e.target.value)}
                                placeholder="Description"
                                className="col-span-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-semibold focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all text-sm"
                              />
                            </div>
                          </div>
                          {drills.length > 1 && (
                            <motion.button
                              onClick={() => handleRemoveDrill(index)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-white/5 border-t border-white/10 flex justify-end space-x-3">
                <motion.button
                  onClick={() => setShowCreateModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-white hover:bg-white/10 rounded-lg transition-colors font-semibold"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleCreatePractice}
                  disabled={creating || !practiceDate || !practiceFocus}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-bold shadow-glow-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create Practice'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
