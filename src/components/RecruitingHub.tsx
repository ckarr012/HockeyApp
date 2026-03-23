import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus, Star, Phone, GraduationCap, TrendingUp, Eye, X, Save,
  Trash2, Video, Loader2, Plus, ExternalLink, AlertTriangle
} from 'lucide-react'
import {
  fetchProspects, fetchProspectDetails, createProspect, updateProspect,
  deleteProspect, addProspectVideo, Prospect, ProspectVideo
} from '../api/api'
import LoadingSpinner from './LoadingSpinner'

interface RecruitingHubProps {
  teamId: string
}

type ProspectStatus = 'Watching' | 'Contacted' | 'Offered' | 'Committed'

const STATUS_CONFIG: Record<ProspectStatus, { color: string; bg: string; icon: string }> = {
  Watching:  { color: 'text-ice-300',    bg: 'bg-ice-500/20 border-ice-500/30',       icon: '👀' },
  Contacted: { color: 'text-yellow-300', bg: 'bg-yellow-500/20 border-yellow-500/30', icon: '📞' },
  Offered:   { color: 'text-purple-300', bg: 'bg-purple-500/20 border-purple-500/30', icon: '💼' },
  Committed: { color: 'text-green-300',  bg: 'bg-green-500/20 border-green-500/30',   icon: '✅' },
}

const STATUSES: ProspectStatus[] = ['Watching', 'Contacted', 'Offered', 'Committed']

const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-ice-400 focus:border-ice-500 focus:ring-2 focus:ring-ice-500/50 transition-all outline-none text-sm"
const labelClass = "block text-xs font-bold text-ice-400 uppercase tracking-wider mb-2"

function StarRating({ rating, onChange }: { rating: number; onChange?: (r: number) => void }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
        </button>
      ))}
    </div>
  )
}

export default function RecruitingHub({ teamId }: RecruitingHubProps) {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [gradYear, setGradYear] = useState(2026)
  const [currentTeam, setCurrentTeam] = useState('')
  const [scoutRating, setScoutRating] = useState(3)
  const [contactInfo, setContactInfo] = useState('')
  const [status, setStatus] = useState<ProspectStatus>('Watching')
  const [coachingNotes, setCoachingNotes] = useState('')

  // Detail panel
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [prospectVideos, setProspectVideos] = useState<ProspectVideo[]>([])
  const [showDetail, setShowDetail] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Video form
  const [showVideoForm, setShowVideoForm] = useState(false)
  const [videoTitle, setVideoTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [addingVideo, setAddingVideo] = useState(false)

  const loadProspects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProspects(teamId)
      setProspects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prospects')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => { loadProspects() }, [loadProspects])

  const handleViewDetails = async (prospect: Prospect) => {
    try {
      setDetailLoading(true)
      setShowDetail(true)
      setShowDeleteConfirm(false)
      const details = await fetchProspectDetails(prospect.id, teamId)
      setSelectedProspect(details.prospect)
      setProspectVideos(details.videos)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailLoading(false)
    }
  }

  const resetForm = () => {
    setName(''); setPosition(''); setGradYear(2026); setCurrentTeam('')
    setScoutRating(3); setContactInfo(''); setStatus('Watching'); setCoachingNotes('')
  }

  const handleAddProspect = async () => {
    if (!name.trim() || !position) return
    try {
      setSaving(true)
      await createProspect(teamId, { name, position, gradYear, currentTeam, scoutRating, contactInfo, status, coachingNotes })
      await loadProspects()
      setShowAddModal(false)
      resetForm()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (prospect: Prospect, newStatus: ProspectStatus) => {
    try {
      await updateProspect(prospect.id, { ...prospect, teamId, status: newStatus })
      await loadProspects()
      if (selectedProspect?.id === prospect.id) {
        setSelectedProspect(prev => prev ? { ...prev, status: newStatus } : prev)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProspect = async () => {
    if (!selectedProspect) return
    try {
      setDeleting(true)
      await deleteProspect(selectedProspect.id, teamId)
      await loadProspects()
      setShowDetail(false)
      setShowDeleteConfirm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  const handleAddVideo = async () => {
    if (!selectedProspect || !videoTitle.trim() || !videoUrl.trim()) return
    try {
      setAddingVideo(true)
      await addProspectVideo(selectedProspect.id, teamId, { title: videoTitle, videoUrl })
      const details = await fetchProspectDetails(selectedProspect.id, teamId)
      setProspectVideos(details.videos)
      setVideoTitle(''); setVideoUrl(''); setShowVideoForm(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingVideo(false)
    }
  }

  const getProspectsByStatus = (s: ProspectStatus) => prospects.filter(p => p.status === s)

  if (loading) return <LoadingSpinner message="Loading recruiting pipeline..." />

  if (error) return (
    <div className="p-8">
      <div className="glass-strong border border-goal-500/30 rounded-xl p-6 bg-goal-500/10">
        <p className="text-goal-300 font-semibold">{error}</p>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white text-shadow">🎓 Recruiting Hub</h2>
          <p className="text-ice-200 mt-1">Track and manage your prospect pipeline</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowAddModal(true) }}
          className="px-6 py-3 bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg font-semibold shadow-glow-blue hover:shadow-xl transition-all flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add Prospect
        </motion.button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s]
          const count = getProspectsByStatus(s).length
          return (
            <div key={s} className={`glass-strong rounded-xl p-4 border ${cfg.bg}`}>
              <p className="text-lg font-black text-white">{count}</p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${cfg.color}`}>{cfg.icon} {s}</p>
            </div>
          )
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map(s => {
          const cfg = STATUS_CONFIG[s]
          const columnProspects = getProspectsByStatus(s)
          return (
            <div key={s} className="flex-1 min-w-[260px]">
              <div className="glass-strong rounded-xl border border-white/10 overflow-hidden">
                <div className={`px-4 py-3 border-b border-white/10 flex items-center justify-between`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.icon} {s}</h3>
                  <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold text-ice-300">{columnProspects.length}</span>
                </div>
                <div className="p-3 space-y-3 min-h-[200px]">
                  {columnProspects.map((prospect, i) => (
                    <motion.div
                      key={prospect.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => handleViewDetails(prospect)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-glow-blue ${cfg.bg}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-white text-sm">{prospect.name}</p>
                          <p className="text-xs text-ice-300">{prospect.position}</p>
                        </div>
                        {prospect.scoutRating && <StarRating rating={prospect.scoutRating} />}
                      </div>
                      {prospect.currentTeam && (
                        <p className="text-xs text-ice-400 mb-2 truncate">{prospect.currentTeam}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-ice-400">
                          <GraduationCap className="w-3 h-3" /> Class of {prospect.gradYear}
                        </span>
                        <span className="text-ice-500 font-semibold flex items-center gap-1">
                          <Eye className="w-3 h-3" /> View
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {columnProspects.length === 0 && (
                    <div className="text-center py-8 text-ice-500 text-xs font-medium">
                      No prospects here yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Prospect Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="glass-strong rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                  <h3 className="text-lg font-bold text-white">Add New Prospect</h3>
                  <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Player name" className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                    <div>
                      <label className={labelClass}>Position *</label>
                      <select value={position} onChange={e => setPosition(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }}>
                        <option value="" style={{ backgroundColor: '#1e3a5f' }}>Select position</option>
                        {['Center', 'Left Wing', 'Right Wing', 'Defense', 'Goalie'].map(p => (
                          <option key={p} value={p} style={{ backgroundColor: '#1e3a5f' }}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Grad Year</label><input type="number" value={gradYear} onChange={e => setGradYear(parseInt(e.target.value))} className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                    <div>
                      <label className={labelClass}>Scout Rating</label>
                      <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center">
                        <StarRating rating={scoutRating} onChange={setScoutRating} />
                        <span className="ml-2 text-xs text-ice-400">({scoutRating}/5)</span>
                      </div>
                    </div>
                  </div>
                  <div><label className={labelClass}>Current Team</label><input value={currentTeam} onChange={e => setCurrentTeam(e.target.value)} placeholder="High school or junior team" className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                  <div><label className={labelClass}>Contact Info</label><input value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="Email, phone, etc." className={inputClass} style={{ colorScheme: 'dark' }} /></div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value as ProspectStatus)} className={inputClass} style={{ colorScheme: 'dark' }}>
                      {STATUSES.map(s => <option key={s} value={s} style={{ backgroundColor: '#1e3a5f' }}>{STATUS_CONFIG[s].icon} {s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Coaching Notes</label>
                    <textarea value={coachingNotes} onChange={e => setCoachingNotes(e.target.value)} rows={3} placeholder="Scouting observations and evaluation notes..." className={`${inputClass} resize-none`} style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                  <motion.button
                    whileHover={{ scale: !name.trim() || !position ? 1 : 1.03 }}
                    whileTap={{ scale: !name.trim() || !position ? 1 : 0.97 }}
                    onClick={handleAddProspect}
                    disabled={saving || !name.trim() || !position}
                    className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Add Prospect'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Prospect Detail Panel */}
      <AnimatePresence>
        {showDetail && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetail(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="fixed right-0 top-0 h-full z-50 w-full max-w-lg flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="glass-strong h-full flex flex-col border-l border-white/10 shadow-2xl overflow-hidden">

                {detailLoading ? (
                  <div className="flex items-center justify-center flex-1">
                    <Loader2 className="w-8 h-8 animate-spin text-ice-400" />
                  </div>
                ) : selectedProspect ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedProspect.name}</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-ice-400">{selectedProspect.position}</span>
                          <span className="text-white/20">·</span>
                          <span className="text-xs text-ice-400">Class of {selectedProspect.gradYear}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedProspect.status as ProspectStatus]?.bg}`}>
                            {STATUS_CONFIG[selectedProspect.status as ProspectStatus]?.icon} {selectedProspect.status}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => setShowDetail(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

                      {/* Status + Rating */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Recruitment Status</label>
                          <select
                            value={selectedProspect.status}
                            onChange={e => handleUpdateStatus(selectedProspect, e.target.value as ProspectStatus)}
                            className={inputClass}
                            style={{ colorScheme: 'dark' }}
                          >
                            {STATUSES.map(s => <option key={s} value={s} style={{ backgroundColor: '#1e3a5f' }}>{STATUS_CONFIG[s].icon} {s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Scout Rating</label>
                          <div className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                            <StarRating rating={selectedProspect.scoutRating ?? 0} />
                            <span className="text-xs text-ice-400">({selectedProspect.scoutRating}/5)</span>
                          </div>
                        </div>
                      </div>

                      {/* Info cards */}
                      <div className="grid grid-cols-2 gap-3">
                        {selectedProspect.currentTeam && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-1">Current Team</p>
                            <p className="text-sm font-semibold text-white">{selectedProspect.currentTeam}</p>
                          </div>
                        )}
                        {selectedProspect.contactInfo && (
                          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</p>
                            <p className="text-sm font-semibold text-white truncate">{selectedProspect.contactInfo}</p>
                          </div>
                        )}
                      </div>

                      {/* Coaching notes */}
                      {selectedProspect.coachingNotes && (
                        <div>
                          <label className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <TrendingUp className="w-3.5 h-3.5" /> Coaching Notes & Evaluation
                          </label>
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-sm text-ice-200 leading-relaxed whitespace-pre-wrap">{selectedProspect.coachingNotes}</p>
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold text-ice-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5" /> Highlight Videos ({prospectVideos.length})
                          </label>
                          <button
                            onClick={() => setShowVideoForm(!showVideoForm)}
                            className="flex items-center gap-1 text-xs font-bold text-ice-400 hover:text-ice-200 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Video
                          </button>
                        </div>

                        <AnimatePresence>
                          {showVideoForm && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mb-3 space-y-2 p-4 bg-white/5 rounded-xl border border-white/10"
                            >
                              <input value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Video title" className={inputClass} style={{ colorScheme: 'dark' }} />
                              <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="YouTube / Hudl URL" className={inputClass} style={{ colorScheme: 'dark' }} />
                              <div className="flex gap-2">
                                <button onClick={() => setShowVideoForm(false)} className="flex-1 py-2 text-xs font-semibold text-ice-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleAddVideo}
                                  disabled={addingVideo || !videoTitle.trim() || !videoUrl.trim()}
                                  className="flex-1 py-2 text-xs font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                                >
                                  {addingVideo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                  {addingVideo ? 'Adding...' : 'Add'}
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {prospectVideos.length > 0 ? (
                          <div className="space-y-2">
                            {prospectVideos.map(video => (
                              <a
                                key={video.id}
                                href={video.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-goal-500/20 flex items-center justify-center">
                                    <Video className="w-4 h-4 text-goal-400" />
                                  </div>
                                  <span className="text-sm font-semibold text-white">{video.title}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-ice-500 group-hover:text-ice-300 transition-colors" />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-white/10 rounded-xl">
                            <Video className="w-8 h-8 text-ice-500 mx-auto mb-2" />
                            <p className="text-ice-500 text-sm">No videos added yet</p>
                          </div>
                        )}
                      </div>

                      {/* Delete confirm */}
                      <AnimatePresence>
                        {showDeleteConfirm && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="rounded-xl border border-goal-500/40 bg-goal-500/10 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="w-4 h-4 text-goal-400" />
                              <p className="text-sm font-bold text-goal-300">Delete {selectedProspect.name}?</p>
                            </div>
                            <p className="text-xs text-goal-200 mb-4">This cannot be undone.</p>
                            <div className="flex gap-2">
                              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-3 py-2 text-xs font-semibold text-ice-300 bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                              <button onClick={handleDeleteProspect} disabled={deleting} className="flex-1 px-3 py-2 text-xs font-bold text-white bg-goal-600 hover:bg-goal-500 rounded-lg transition-all disabled:opacity-60 flex items-center justify-center gap-1">
                                {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                {deleting ? 'Deleting...' : 'Yes, Delete'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                      <button
                        onClick={() => { setShowDeleteConfirm(true) }}
                        disabled={showDeleteConfirm}
                        className="p-2.5 text-goal-400 hover:text-goal-300 hover:bg-goal-500/10 rounded-lg transition-all disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setShowDetail(false)} className="px-5 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                        Close
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
