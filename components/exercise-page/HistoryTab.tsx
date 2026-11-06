import { StyleSheet, Text, View } from 'react-native';

import { usePerHand } from '@/stores/perHand';
import { setBadges } from '@/lib/format/setFormat';
import { setBadgeColor } from '@/components/set-table/SetBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { setLabel } from '@/lib/stats/exerciseMetrics';
import { epley1RM } from '@/lib/stats/records';
import { weekdayDateTime } from '@/lib/format/date';
import { shared } from './styles';
import type { ExerciseTabProps } from './types';

// One card per workout, newest first, with its sets
// (and each set's estimated 1RM for weighted exercises).
export function HistoryTab({ detail }: ExerciseTabProps) {
  const sessions = [...detail.sessions].reverse();
  const perHand = !!usePerHand(detail.id);
  if (sessions.length === 0) return <EmptyState message="No workouts with this exercise yet." note style={shared.body} />;
  return (
    <View style={shared.body}>
      {sessions.map((s) => (
        <View key={s.workoutId} style={styles.historyCard}>
          <Text style={styles.historyTitle}>{s.title}</Text>
          <Text style={styles.historyDate}>{weekdayDateTime(new Date(s.startTime))}</Text>
          <View style={styles.historyHeader}>
            <Text style={styles.historyHead}>SETS PERFORMED</Text>
            {detail.type === 'weight_reps' && <Text style={styles.historyHead}>1RM</Text>}
          </View>
          {s.sets.map((set, i, all) => (
            <View key={set.id} style={styles.historyRow}>
              <Text style={styles.historySet}>
                <Text style={setBadgeColor(set.setType) ?? styles.setNumber}>
                  {setBadges(all.map((x) => x.setType))[i]}
                </Text>
                {'   '}
                {setLabel(detail.type, set, perHand)}
              </Text>
              {detail.type === 'weight_reps' && (set.weightKg ?? 0) > 0 && (set.reps ?? 0) > 0 && (
                <Text style={styles.historySet}>{Math.round(epley1RM(set.weightKg!, set.reps!))}</Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    marginTop: SPACE.lg,
    padding: LAYOUT.cardPadding,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  historyTitle: {
    ...TYPE.rowSemibold,
  },
  historyDate: {
    marginTop: SPACE.xxs,
    ...TYPE.small,
    color: COLORS.textSecondary,
  },
  historyHeader: {
    marginTop: SPACE.md,
    marginBottom: SPACE.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyHead: {
    ...TYPE.xsMedium,
    color: COLORS.textSecondary,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACE.xs,
  },
  historySet: {
    ...TYPE.body,
  },
  setNumber: {
    color: COLORS.textSecondary,
  },
});
