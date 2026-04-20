import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { MatchupAnalysis } from './MatchupAnalysisResults'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  summaryBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 15,
    borderRadius: 4,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: 'bold',
    lineHeight: 1.4,
  },
  paragraph: {
    lineHeight: 1.5,
    marginBottom: 8,
  },
  matchupCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fafafa',
    borderLeft: '3 solid #333',
  },
  matchupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  matchupTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  priorityHigh: {
    fontSize: 9,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  priorityMedium: {
    fontSize: 9,
    color: '#f57c00',
    fontWeight: 'bold',
  },
  priorityLow: {
    fontSize: 9,
    color: '#666',
  },
  matchupVs: {
    fontSize: 10,
    marginBottom: 4,
    color: '#333',
  },
  matchupReasoning: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fafafa',
    borderLeft: '2 solid #666',
  },
  gridItemFull: {
    width: '100%',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fafafa',
    borderLeft: '2 solid #666',
  },
  gridTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  gridText: {
    fontSize: 9,
    lineHeight: 1.3,
  },
  playerCard: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff5f5',
    borderLeft: '2 solid #d32f2f',
  },
  playerHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  playerJersey: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    color: '#d32f2f',
  },
  playerName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  playerSuggestion: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  specialTeamsBox: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  specialTeamsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  confidenceBox: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fffbf0',
    borderLeft: '3 solid #f57c00',
  },
  confidenceTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#555',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#999',
    borderTop: '1 solid #ddd',
    paddingTop: 10,
  },
})

interface MatchupAnalysisPDFProps {
  analysis: MatchupAnalysis
  teamName?: string
}

export default function MatchupAnalysisPDF({ analysis, teamName = 'Team' }: MatchupAnalysisPDFProps) {
  const { opponent_name, summary, generated_at, analysis: content } = analysis
  const {
    forwardMatchups,
    defensivePairMatchups,
    keyPlayersToNeutralize,
    powerPlayUnitSuggestion,
    penaltyKillUnitSuggestion,
    overallStrategy,
    confidenceNote,
  } = content

  const formattedDate = new Date(generated_at + 'Z').toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const getPriorityStyle = (priority: string) => {
    if (priority === 'high') return styles.priorityHigh
    if (priority === 'medium') return styles.priorityMedium
    return styles.priorityLow
  }

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Matchup Plan: {teamName} vs {opponent_name}</Text>
          <Text style={styles.subtitle}>Generated: {formattedDate}</Text>
        </View>

        {/* Summary */}
        {summary && (
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>{summary}</Text>
          </View>
        )}

        {/* Overall Strategy */}
        {overallStrategy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overall Strategy</Text>
            <Text style={styles.paragraph}>{overallStrategy}</Text>
          </View>
        )}

        {/* Forward Line Matchups */}
        {forwardMatchups && forwardMatchups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forward Line Matchups</Text>
            {forwardMatchups.sort((a, b) => a.ourLineNumber - b.ourLineNumber).map((matchup) => (
              <View key={matchup.ourLineNumber} style={styles.matchupCard}>
                <View style={styles.matchupHeader}>
                  <Text style={styles.matchupTitle}>
                    Line {matchup.ourLineNumber} - {matchup.ourLineLabel}
                  </Text>
                  <Text style={getPriorityStyle(matchup.priority)}>
                    {matchup.priority.toUpperCase()} PRIORITY
                  </Text>
                </View>
                <Text style={styles.matchupVs}>vs {matchup.theirProjectedLine}</Text>
                <Text style={styles.matchupReasoning}>{matchup.reasoning}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Defensive Pair Matchups */}
        {defensivePairMatchups && defensivePairMatchups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Defensive Pair Matchups</Text>
            <View style={styles.grid}>
              {defensivePairMatchups.map((pair) => (
                <View key={pair.ourPairNumber} style={styles.gridItem}>
                  <Text style={styles.gridTitle}>Pair {pair.ourPairNumber}</Text>
                  <Text style={styles.gridSubtitle}>vs {pair.theirTopThreats}</Text>
                  <Text style={styles.gridText}>{pair.reasoning}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Key Players to Neutralize */}
        {keyPlayersToNeutralize && keyPlayersToNeutralize.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Players to Neutralize</Text>
            {keyPlayersToNeutralize.map((player) => (
              <View key={player.opponentPlayerName} style={styles.playerCard}>
                <View style={styles.playerHeader}>
                  <Text style={styles.playerJersey}>{player.opponentJersey}</Text>
                  <Text style={styles.playerName}>{player.opponentPlayerName}</Text>
                </View>
                <Text style={styles.playerSuggestion}>Suggested: {player.suggestedMatchup}</Text>
                <Text style={styles.gridText}>{player.rationale}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Special Teams */}
        {(powerPlayUnitSuggestion || penaltyKillUnitSuggestion) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Teams</Text>
            {powerPlayUnitSuggestion && (
              <View style={styles.specialTeamsBox}>
                <Text style={styles.specialTeamsTitle}>Power Play</Text>
                <Text style={styles.gridText}>{powerPlayUnitSuggestion}</Text>
              </View>
            )}
            {penaltyKillUnitSuggestion && (
              <View style={styles.specialTeamsBox}>
                <Text style={styles.specialTeamsTitle}>Penalty Kill</Text>
                <Text style={styles.gridText}>{penaltyKillUnitSuggestion}</Text>
              </View>
            )}
          </View>
        )}

        {/* Confidence Note */}
        {confidenceNote && (
          <View style={styles.confidenceBox}>
            <Text style={styles.confidenceTitle}>Confidence Note</Text>
            <Text style={styles.confidenceText}>{confidenceNote}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Hockey Coach Pro • {new Date().toLocaleDateString()}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
