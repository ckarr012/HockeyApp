import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Printer, Clock, Users, ChevronRight, Sparkles } from 'lucide-react'
import { PracticePlan, Game } from '../api/api'

interface PracticePlanModalProps {
  plan: PracticePlan
  game: Game
  isOpen: boolean
  onClose: () => void
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  skating: { label: 'Skating', color: 'bg-ice-500/20 text-ice-300 border-ice-500/30', icon: '⛸️' },
  shooting: { label: 'Shooting', color: 'bg-goal-500/20 text-goal-300 border-goal-500/30', icon: '🚨' },
  defensive: { label: 'Defensive', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: '🛡️' },
  offensive: { label: 'Offensive', color: 'bg-green-500/20 text-green-300 border-green-500/30', icon: '⚡' },
  special_teams: { label: 'Special Teams', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', icon: '⭐' },
  conditioning: { label: 'Conditioning', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30', icon: '💪' },
  goalie: { label: 'Goalie', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: '🥅' },
}

export default function PracticePlanModal({ plan, game, isOpen, onClose }: PracticePlanModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Practice Plan — vs ${game.opponent}</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 24px; color: #111; }
            h1 { font-size: 24px; font-weight: 900; margin-bottom: 4px; }
            h2 { font-size: 18px; font-weight: 700; margin: 24px 0 8px; }
            h3 { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
            .meta { font-size: 13px; color: #555; margin-bottom: 20px; }
            .summary { background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 12px 16px; border-radius: 4px; margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
            .focus-areas { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
            .focus-tag { background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .drill { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; break-inside: avoid; }
            .drill-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
            .drill-name { font-size: 16px; font-weight: 700; }
            .drill-meta { display: flex; gap: 12px; font-size: 12px; color: #6b7280; margin-bottom: 10px; }
            .drill-desc { font-size: 13px; line-height: 1.6; margin-bottom: 10px; color: #374151; }
            .coaching-points { margin: 0; padding-left: 18px; }
            .coaching-points li { font-size: 13px; color: #374151; margin-bottom: 4px; }
            .category-tag { background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .total { text-align: right; font-size: 13px; color: #6b7280; margin-top: 16px; font-weight: 600; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <h1>🏒 Practice Plan</h1>
          <div class="meta">Generated from game vs ${game.opponent} · ${game.status === 'completed' ? `Final: ${game.teamScore} - ${game.opponentScore}` : game.status}</div>
          <div class="summary">${plan.summary}</div>
          <h2>Focus Areas</h2>
          <div class="focus-areas">${plan.focusAreas.map(f => `<span class="focus-tag">${f}</span>`).join('')}</div>
          <h2>Drills (${plan.drills.length} drills · ${plan.totalDuration} min)</h2>
          ${plan.drills.map((drill, i) => `
            <div class="drill">
              <div class="drill-header">
                <div class="drill-name">${i + 1}. ${drill.name}</div>
                <span class="category-tag">${drill.category.replace('_', ' ')}</span>
              </div>
              <div class="drill-meta">
                <span>⏱ ${drill.duration} min</span>
                <span>👥 ${drill.playerFocus.join(', ')}</span>
              </div>
              <div class="drill-desc">${drill.description}</div>
              ${drill.coachingPoints.length > 0 ? `
                <strong style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Coaching Points</strong>
                <ul class="coaching-points">${drill.coachingPoints.map(p => `<li>${p}</li>`).join('')}</ul>
              ` : ''}
            </div>
          `).join('')}
          <div class="total">Total Practice Time: ${plan.totalDuration} minutes</div>
        </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: 60 }} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="fixed inset-4 md:inset-8 flex flex-col"
            style={{ zIndex: 60 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="glass-strong rounded-2xl flex flex-col h-full border border-white/10 shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI Practice Plan</h2>
                    <p className="text-xs text-ice-300">Generated from game vs {game.opponent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handlePrint}
                    className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" /> Print / Export
                  </motion.button>
                  <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-ice-400 hover:text-white hover:bg-white/10 transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5" ref={printRef}>

                {/* Summary */}
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 mb-6">
                  <p className="text-white leading-relaxed">{plan.summary}</p>
                </div>

                {/* Focus areas + duration */}
                <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
                  <div>
                    <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Focus Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {plan.focusAreas.map((area, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-2.5 border border-white/10 shrink-0">
                    <Clock className="w-4 h-4 text-ice-400" />
                    <span className="text-white font-bold">{plan.totalDuration} min total</span>
                    <span className="text-ice-400 text-sm">· {plan.drills.length} drills</span>
                  </div>
                </div>

                {/* Drills */}
                <div className="space-y-4">
                  {plan.drills.map((drill, i) => {
                    const cat = CATEGORY_CONFIG[drill.category] ?? { label: drill.category, color: 'bg-white/10 text-ice-300 border-white/10', icon: '🏒' }
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-strong rounded-xl border border-white/10 overflow-hidden"
                      >
                        {/* Drill header */}
                        <div className="flex items-center gap-3 px-5 py-3.5 bg-white/5 border-b border-white/5">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm font-black text-ice-300 shrink-0">
                            {i + 1}
                          </div>
                          <h3 className="text-base font-bold text-white flex-1">{drill.name}</h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
                            {cat.icon} {cat.label}
                          </span>
                        </div>

                        {/* Drill body */}
                        <div className="px-5 py-4 space-y-3">
                          {/* Meta */}
                          <div className="flex items-center gap-4 text-xs text-ice-400">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{drill.duration} min</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{drill.playerFocus.join(', ')}</span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-ice-200 leading-relaxed">{drill.description}</p>

                          {/* Coaching points */}
                          {drill.coachingPoints.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-ice-400 uppercase tracking-wider mb-2">Coaching Points</p>
                              <ul className="space-y-1.5">
                                {drill.coachingPoints.map((point, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-ice-300">
                                    <ChevronRight className="w-3.5 h-3.5 text-ice-500 mt-0.5 shrink-0" />
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
