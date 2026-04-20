import { motion } from 'framer-motion'
import { X, AlertCircle, Zap, Shield, Download } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { PDFDownloadLink } from '@react-pdf/renderer'
import MatchupAnalysisPDF from './MatchupAnalysisPDF'

// ── TYPE DEFINITIONS ──
export interface ForwardMatchup {
  ourLineNumber: number
  ourLineLabel: string
  theirProjectedLine: string
  reasoning: string
  priority: 'high' | 'medium' | 'low'
}

export interface DefensivePairMatchup {
  ourPairNumber: number
  theirTopThreats: string
  reasoning: string
}

export interface KeyPlayerToNeutralize {
  opponentPlayerName: string
  opponentJersey: string
  suggestedMatchup: string
  rationale: string
}

export interface MatchupContent {
  forwardMatchups: ForwardMatchup[]
  defensivePairMatchups: DefensivePairMatchup[]
  keyPlayersToNeutralize: KeyPlayerToNeutralize[]
  powerPlayUnitSuggestion: string
  penaltyKillUnitSuggestion: string
  overallStrategy: string
  confidenceNote: string
}

export interface MatchupAnalysis {
  id: number | string
  team_id: string
  lineup_id: string
  game_id: string | null
  opponent_name: string
  summary: string
  generated_at: string
  created_at: string
  analysis: MatchupContent
}

interface MatchupAnalysisResultsProps {
  analysis: MatchupAnalysis | null
  onDismiss: () => void
}

// ── PRIORITY CHIP COMPONENT ──
const PriorityChip = ({ priority }: { priority: 'high' | 'medium' | 'low' }) => {
  const styles = {
    high: 'bg-goal-500/20 text-goal-300 border-goal-500/40',
    medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    low: 'bg-white/10 text-ice-300 border-white/20'
  }
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[priority]}`}>
      {priority}
    </span>
  )
}

// ── MAIN COMPONENT ──
export default function MatchupAnalysisResults({ analysis, onDismiss }: MatchupAnalysisResultsProps) {
  if (!analysis || !analysis.analysis) return null

  // Destructure the two-level structure
  const { opponent_name, summary, generated_at, analysis: content } = analysis
  const { 
    forwardMatchups, 
    defensivePairMatchups, 
    keyPlayersToNeutralize, 
    powerPlayUnitSuggestion, 
    penaltyKillUnitSuggestion, 
    overallStrategy, 
    confidenceNote 
  } = content

  // Format timestamp - append Z to treat as UTC
  const timeAgo = formatDistanceToNow(new Date(generated_at + 'Z'), { addSuffix: true })
  
  // Generate PDF filename
  const pdfDate = new Date(generated_at + 'Z').toISOString().split('T')[0]
  const slugifiedOpponent = opponent_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const pdfFilename = `matchup-plan-${slugifiedOpponent}-${pdfDate}.pdf`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="glass-strong rounded-xl p-6 border border-ice-500/20 bg-gradient-to-br from-ice-500/5 to-purple-500/5"
    >
      {/* HEADER ROW */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Matchup Plan vs {opponent_name}
          </h2>
          <p className="text-xs text-ice-400">Generated {timeAgo}</p>
        </div>
        <div className="flex items-center gap-2">
          <PDFDownloadLink
            document={<MatchupAnalysisPDF analysis={analysis} teamName="Roosevelt Lakers" />}
            fileName={pdfFilename}
            className="px-3 py-2 text-sm font-semibold text-ice-400 hover:text-white border border-ice-500/40 hover:border-ice-500/60 rounded-lg transition-all flex items-center gap-2"
          >
            {({ loading }) => (
              <>
                <Download className="w-4 h-4" />
                {loading ? 'Preparing...' : 'Download PDF'}
              </>
            )}
          </PDFDownloadLink>
          <button
            onClick={onDismiss}
            className="p-2 text-ice-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TOP-LINE SUMMARY CARD */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 p-4 rounded-lg bg-gradient-to-r from-ice-500/20 to-purple-500/20 border border-ice-500/30"
        >
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-ice-400 shrink-0 mt-0.5" />
            <p className="text-white font-semibold text-base whitespace-pre-wrap">{summary}</p>
          </div>
        </motion.div>
      )}

      {/* OVERALL STRATEGY */}
      {overallStrategy && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-ice-400" />
            Overall Strategy
          </h3>
          <div className="glass-strong rounded-lg p-4 border border-white/10">
            <p className="text-ice-200 text-sm leading-relaxed whitespace-pre-wrap">{overallStrategy}</p>
          </div>
        </motion.div>
      )}

      {/* FORWARD LINE MATCHUPS */}
      {forwardMatchups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-3">Forward Line Matchups</h3>
          <div className="space-y-3">
            {forwardMatchups.sort((a, b) => a.ourLineNumber - b.ourLineNumber).map((matchup, idx) => (
              <motion.div
                key={matchup.ourLineNumber}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + idx * 0.05 }}
                className="glass-strong rounded-lg p-4 border border-ice-500/20 hover:border-ice-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xl font-bold text-white">Line {matchup.ourLineNumber}</div>
                    <div className="text-sm text-ice-400">{matchup.ourLineLabel}</div>
                  </div>
                  <PriorityChip priority={matchup.priority} />
                </div>
                <div className="mb-2">
                  <span className="text-ice-500 text-sm">vs </span>
                  <span className="text-white font-semibold">{matchup.theirProjectedLine}</span>
                </div>
                <p className="text-ice-300 text-sm leading-relaxed whitespace-pre-wrap">{matchup.reasoning}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DEFENSIVE PAIR MATCHUPS */}
      {defensivePairMatchups && defensivePairMatchups.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-3">Defensive Pair Matchups</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {defensivePairMatchups.map((pair, idx) => (
              <motion.div
                key={pair.ourPairNumber}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                className="glass-strong rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all"
              >
                <div className="text-lg font-bold text-white mb-2">Pair {pair.ourPairNumber}</div>
                <div className="text-sm text-purple-300 mb-2 font-semibold">
                  vs {pair.theirTopThreats}
                </div>
                <p className="text-ice-300 text-xs leading-relaxed whitespace-pre-wrap">{pair.reasoning}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* KEY PLAYERS TO NEUTRALIZE */}
      {keyPlayersToNeutralize && keyPlayersToNeutralize.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-3">Key Players to Neutralize</h3>
          <div className={keyPlayersToNeutralize.length <= 3 ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'flex gap-3 overflow-x-auto pb-2'}>
            {keyPlayersToNeutralize.map((player, idx) => (
              <motion.div
                key={player.opponentPlayerName}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + idx * 0.05 }}
                className={`glass-strong rounded-lg p-4 border border-goal-500/20 hover:border-goal-500/40 transition-all ${keyPlayersToNeutralize.length > 3 ? 'min-w-[280px]' : ''}`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="text-3xl font-bold text-goal-400">{player.opponentJersey}</div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{player.opponentPlayerName}</div>
                    <div className="text-xs text-ice-400 mt-1">
                      Suggested: <span className="text-ice-300">{player.suggestedMatchup}</span>
                    </div>
                  </div>
                </div>
                <p className="text-ice-300 text-xs leading-relaxed whitespace-pre-wrap">{player.rationale}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SPECIAL TEAMS */}
      {(powerPlayUnitSuggestion || penaltyKillUnitSuggestion) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-lg font-bold text-white mb-3">Special Teams</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {powerPlayUnitSuggestion && (
              <div className="glass-strong rounded-lg p-4 border border-assist-500/30 bg-assist-500/5">
                <div className="text-sm font-bold text-assist-300 uppercase tracking-wider mb-2">Power Play</div>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{powerPlayUnitSuggestion}</p>
              </div>
            )}
            {penaltyKillUnitSuggestion && (
              <div className="glass-strong rounded-lg p-4 border border-goal-500/30 bg-goal-500/5">
                <div className="text-sm font-bold text-goal-300 uppercase tracking-wider mb-2">Penalty Kill</div>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{penaltyKillUnitSuggestion}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* CONFIDENCE NOTE */}
      {confidenceNote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-strong rounded-lg p-4 border border-yellow-500/20 bg-yellow-500/5"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-yellow-300 mb-1">Confidence Note</div>
              <p className="text-yellow-200/80 text-xs leading-relaxed whitespace-pre-wrap">{confidenceNote}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
