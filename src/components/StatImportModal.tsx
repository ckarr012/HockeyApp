import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, ImagePlus, RotateCcw, BarChart2 } from 'lucide-react'
import { importStatsFromImage, Player } from '../api/api'

interface StatImportModalProps {
  players: Player[]
  onClose: () => void
  onImportComplete: (stats: Array<{ playerName: string; goals: number; assists: number; shots: number; blocks: number; pims: number }>) => void
}

type Step = 'upload' | 'analyzing' | 'preview'

type DetectedStat = {
  playerName: string
  goals: number
  assists: number
  shots: number
  blocks: number
  pims: number
  matchedPlayer: Player | null
  selected: boolean
  id: string
}

export default function StatImportModal({ players, onClose, onImportComplete }: StatImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState('image/jpeg')
  const [detected, setDetected] = useState<DetectedStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setImagePreview(null)
    setImageBase64(null)
    setDetected([])
    setError(null)
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setError(null)
    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      setImagePreview(result)
      setImageBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [])

  const handleAnalyze = async () => {
    if (!imageBase64) return
    setStep('analyzing')
    setError(null)
    try {
      const playerNames = players.map(p => `${p.firstName} ${p.lastName}`)
      const results = await importStatsFromImage(imageBase64, mediaType, playerNames)

      const detectedStats: DetectedStat[] = results.map((s, i) => {
        const match = players.find(p => {
          const full = `${p.firstName} ${p.lastName}`.toLowerCase()
          const name = s.playerName.toLowerCase()
          return full === name || full.includes(name) || name.includes(p.lastName.toLowerCase())
        }) || null
        return { ...s, matchedPlayer: match, selected: !!match, id: `stat-${i}` }
      })
      setDetected(detectedStats)
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
      setStep('upload')
    }
  }

  const toggleRow = (id: string) => setDetected(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d))
  const toggleAll = () => {
    const allSelected = detected.every(d => d.selected)
    setDetected(prev => prev.map(d => ({ ...d, selected: !allSelected })))
  }

  const handleConfirm = () => {
    const selected = detected.filter(d => d.selected)
    onImportComplete(selected)
  }

  const selectedCount = detected.filter(d => d.selected).length
  const labelClass = "text-xs font-bold text-ice-400 uppercase tracking-wider"

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-strong rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <ImagePlus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Import Stats from Photo</h2>
                <p className="text-xs text-ice-300">Upload a box score or stat sheet</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">

            {/* Upload step */}
            {(step === 'upload' || step === 'analyzing') && (
              <div className="space-y-5">
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden
                    ${isDragging ? 'border-purple-400 bg-purple-500/10' : 'border-white/20 hover:border-white/40 bg-white/3'}
                    ${imagePreview ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ minHeight: '200px' }}
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Stat sheet" className="w-full max-h-64 object-contain rounded-xl" />
                      <button onClick={e => { e.stopPropagation(); reset() }} className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center px-6">
                      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-ice-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">Drop your stat sheet here</p>
                        <p className="text-ice-400 text-sm mt-1">Box scores, printed game sheets, screenshots</p>
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} className="hidden" />

                {step === 'analyzing' && (
                  <div className="flex items-center justify-center gap-3 py-3 text-ice-300">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="font-medium">Claude is reading the stat sheet...</span>
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                  </div>
                )}
              </div>
            )}

            {/* Preview step */}
            {step === 'preview' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{detected.length} players detected</p>
                  <button onClick={toggleAll} className="text-xs font-bold text-ice-400 hover:text-ice-200 transition-colors">
                    {detected.every(d => d.selected) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="rounded-lg overflow-hidden border border-white/10">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-3 py-3 w-8" />
                        <th className={`px-3 py-3 text-left ${labelClass}`}>Player</th>
                        <th className={`px-3 py-3 text-center ${labelClass}`}>G</th>
                        <th className={`px-3 py-3 text-center ${labelClass}`}>A</th>
                        <th className={`px-3 py-3 text-center ${labelClass}`}>SOG</th>
                        <th className={`px-3 py-3 text-center ${labelClass}`}>BLK</th>
                        <th className={`px-3 py-3 text-center ${labelClass}`}>PIM</th>
                        <th className={`px-3 py-3 text-left ${labelClass} hidden sm:table-cell`}>Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {detected.map(d => (
                        <motion.tr
                          key={d.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => toggleRow(d.id)}
                          className={`cursor-pointer transition-colors ${d.selected ? 'bg-white/5 hover:bg-white/8' : 'opacity-40 hover:opacity-60'}`}
                        >
                          <td className="px-3 py-2.5">
                            <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${d.selected ? 'bg-ice-500 border-ice-500' : 'border-white/30'}`}>
                              {d.selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-semibold text-white">{d.playerName}</td>
                          <td className="px-3 py-2.5 text-center text-ice-200">{d.goals}</td>
                          <td className="px-3 py-2.5 text-center text-ice-200">{d.assists}</td>
                          <td className="px-3 py-2.5 text-center text-ice-200">{d.shots}</td>
                          <td className="px-3 py-2.5 text-center text-ice-200">{d.blocks}</td>
                          <td className="px-3 py-2.5 text-center text-ice-200">{d.pims}</td>
                          <td className="px-3 py-2.5 hidden sm:table-cell">
                            {d.matchedPlayer ? (
                              <span className="text-xs font-semibold text-green-400">&#10003; {d.matchedPlayer.firstName} {d.matchedPlayer.lastName}</span>
                            ) : (
                              <span className="text-xs text-goal-400">No match</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-ice-400 text-center">{selectedCount} of {detected.length} selected. Unmatched players will be skipped.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
            {step === 'preview' ? (
              <>
                <button onClick={() => setStep('upload')} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">&larr; Retake</button>
                <motion.button
                  whileHover={{ scale: selectedCount === 0 ? 1 : 1.03 }}
                  whileTap={{ scale: selectedCount === 0 ? 1 : 0.97 }}
                  onClick={handleConfirm}
                  disabled={selectedCount === 0}
                  className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <BarChart2 className="w-4 h-4" /> Apply {selectedCount} Player{selectedCount !== 1 ? 's' : ''}
                </motion.button>
              </>
            ) : (
              <>
                <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">Cancel</button>
                <motion.button
                  whileHover={{ scale: !imageBase64 ? 1 : 1.03 }}
                  whileTap={{ scale: !imageBase64 ? 1 : 0.97 }}
                  onClick={handleAnalyze}
                  disabled={!imageBase64 || step === 'analyzing'}
                  className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <ImagePlus className="w-4 h-4" /> Analyze Stats
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  )
}
