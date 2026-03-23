import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Loader2, CheckCircle2, AlertTriangle, ImagePlus, RotateCcw, UserCheck } from 'lucide-react'
import { importPlayersFromImage, createPlayer, CreatePlayerInput } from '../api/api'

interface RosterImportModalProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

type ImportedPlayer = CreatePlayerInput & { selected: boolean; id: string }

type Step = 'upload' | 'analyzing' | 'preview' | 'saving' | 'done'

const POSITION_LABELS: Record<string, string> = {
  center: 'C', left_wing: 'LW', right_wing: 'RW',
  left_defense: 'LD', right_defense: 'RD', goalie: 'G',
}

export default function RosterImportModal({ teamId, isOpen, onClose, onImportComplete }: RosterImportModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string>('image/jpeg')
  const [players, setPlayers] = useState<ImportedPlayer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setStep('upload')
    setImagePreview(null)
    setImageBase64(null)
    setPlayers([])
    setError(null)
    setIsDragging(false)
    setSavedCount(0)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, etc.)')
      return
    }
    setError(null)
    setMediaType(file.type)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      // Strip the data:image/...;base64, prefix
      setImageBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
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
      const detected = await importPlayersFromImage(imageBase64, mediaType)
      setPlayers(detected.map((p, i) => ({ ...p, selected: true, id: `import-${i}` })))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed.')
      setStep('upload')
    }
  }

  const togglePlayer = (id: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const toggleAll = () => {
    const allSelected = players.every(p => p.selected)
    setPlayers(prev => prev.map(p => ({ ...p, selected: !allSelected })))
  }

  const handleConfirmImport = async () => {
    const selected = players.filter(p => p.selected)
    if (selected.length === 0) return
    setStep('saving')
    let count = 0
    for (const player of selected) {
      try {
        await createPlayer(teamId, player)
        count++
      } catch {
        // skip individual failures silently
      }
    }
    setSavedCount(count)
    setStep('done')
    onImportComplete()
  }

  const selectedCount = players.filter(p => p.selected).length

  const labelClass = "text-xs font-bold text-ice-300 uppercase tracking-wider"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="glass-strong rounded-xl w-full max-w-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                    <ImagePlus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI Roster Import</h2>
                    <p className="text-xs text-ice-300">Upload a roster photo and let Claude do the rest</p>
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* STEP: UPLOAD */}
                {(step === 'upload' || step === 'analyzing') && (
                  <div className="space-y-5">
                    {/* Drop zone */}
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => !imagePreview && fileInputRef.current?.click()}
                      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden
                        ${isDragging ? 'border-ice-400 bg-ice-500/10' : 'border-white/20 hover:border-white/40 bg-white/3'}
                        ${imagePreview ? 'cursor-default' : ''}`}
                      style={{ minHeight: '220px' }}
                    >
                      {imagePreview ? (
                        <div className="relative">
                          <img src={imagePreview} alt="Roster preview" className="w-full max-h-64 object-contain rounded-xl" />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all rounded-xl" />
                          <button
                            onClick={e => { e.stopPropagation(); reset() }}
                            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center px-6">
                          <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-ice-400" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">Drop your roster photo here</p>
                            <p className="text-ice-400 text-sm mt-1">or click to browse — JPG, PNG supported</p>
                          </div>
                          <p className="text-ice-500 text-xs">Works best with printed team rosters, spreadsheet screenshots, or handwritten sheets</p>
                        </div>
                      )}
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-3 rounded-lg bg-goal-500/20 border border-goal-500/40 text-goal-300 text-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    {step === 'analyzing' && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 py-4 text-ice-300">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                        <span className="font-medium">Claude is reading your roster...</span>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* STEP: PREVIEW */}
                {step === 'preview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">
                        {players.length} player{players.length !== 1 ? 's' : ''} detected
                      </p>
                      <button onClick={toggleAll} className="text-xs font-bold text-ice-400 hover:text-ice-200 transition-colors">
                        {players.every(p => p.selected) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className="rounded-lg overflow-hidden border border-white/10">
                      <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/10">
                          <tr>
                            <th className="px-3 py-3 text-left w-8"></th>
                            <th className={`px-3 py-3 text-left ${labelClass}`}>#</th>
                            <th className={`px-3 py-3 text-left ${labelClass}`}>Name</th>
                            <th className={`px-3 py-3 text-left ${labelClass}`}>Pos</th>
                            <th className={`px-3 py-3 text-left ${labelClass} hidden sm:table-cell`}>Shoots</th>
                            <th className={`px-3 py-3 text-left ${labelClass} hidden md:table-cell`}>Ht / Wt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {players.map(player => (
                            <motion.tr
                              key={player.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => togglePlayer(player.id)}
                              className={`cursor-pointer transition-colors ${player.selected ? 'bg-white/5 hover:bg-white/8' : 'opacity-40 hover:opacity-60'}`}
                            >
                              <td className="px-3 py-2.5">
                                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center
                                  ${player.selected ? 'bg-ice-500 border-ice-500' : 'border-white/30 bg-transparent'}`}>
                                  {player.selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-sm font-bold text-ice-200">
                                {player.jerseyNumber ?? '—'}
                              </td>
                              <td className="px-3 py-2.5 text-sm font-semibold text-white">
                                {player.firstName} {player.lastName}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="px-2 py-0.5 text-xs font-bold bg-ice-500/30 text-ice-200 rounded border border-ice-500/50 uppercase">
                                  {POSITION_LABELS[player.position] ?? player.position ?? '?'}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-sm text-ice-300 uppercase hidden sm:table-cell">
                                {player.shoots ?? '—'}
                              </td>
                              <td className="px-3 py-2.5 text-sm text-ice-300 hidden md:table-cell">
                                {player.height ? `${player.height}cm` : '—'} / {player.weight ? `${player.weight}kg` : '—'}
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <p className="text-xs text-ice-400 text-center">
                      Click a row to include/exclude. {selectedCount} of {players.length} selected.
                    </p>
                  </div>
                )}

                {/* STEP: SAVING */}
                {step === 'saving' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                    <p className="text-white font-semibold">Saving players to roster...</p>
                    <p className="text-ice-400 text-sm">Hang tight!</p>
                  </div>
                )}

                {/* STEP: DONE */}
                {step === 'done' && (
                  <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}>
                      <UserCheck className="w-14 h-14 text-green-400" />
                    </motion.div>
                    <div>
                      <p className="text-white text-xl font-bold">{savedCount} player{savedCount !== 1 ? 's' : ''} added!</p>
                      <p className="text-ice-300 text-sm mt-1">Your roster has been updated successfully.</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-white/5 shrink-0">
                {step === 'done' ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleClose}
                    className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-ice-500 to-ice-600 text-white rounded-lg shadow-glow-blue transition-all"
                  >
                    Done
                  </motion.button>
                ) : step === 'preview' ? (
                  <>
                    <button onClick={() => { setStep('upload') }} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                      ← Retake
                    </button>
                    <motion.button
                      whileHover={{ scale: selectedCount === 0 ? 1 : 1.03 }}
                      whileTap={{ scale: selectedCount === 0 ? 1 : 0.97 }}
                      onClick={handleConfirmImport}
                      disabled={selectedCount === 0}
                      className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Import {selectedCount} Player{selectedCount !== 1 ? 's' : ''}
                    </motion.button>
                  </>
                ) : step === 'upload' ? (
                  <>
                    <button onClick={handleClose} className="px-4 py-2.5 text-sm font-semibold text-ice-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all">
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: !imageBase64 ? 1 : 1.03 }}
                      whileTap={{ scale: !imageBase64 ? 1 : 0.97 }}
                      onClick={handleAnalyze}
                      disabled={!imageBase64}
                      className="px-6 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ImagePlus className="w-4 h-4" />
                      Analyze Roster
                    </motion.button>
                  </>
                ) : null}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
