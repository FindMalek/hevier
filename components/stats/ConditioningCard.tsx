import { StyleSheet, Text, View } from 'react-native';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { STATISTICS_SIZES } from '@/constants/sizes';
import { WEEKLY_CARDIO_TARGET_MIN } from '@/constants/training';
import { plural } from '@/lib/format/text';
import type { ConditioningCardProps } from './types';

// What football and cardio give (Recovery shows what they cost): this week's
// hard cardio against the WHO weekly guideline, the last 4 weeks, and this
// month's games.
export function ConditioningCard({ cardio }: ConditioningCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Conditioning</Text>
      <Text style={styles.cardioMinutes}>
        {cardio.thisWeek} min <Text style={styles.cardioUnit}>hard cardio this week</Text>
      </Text>
      <View style={styles.cardioTrack}>
        <View style={[styles.cardioFill, { width: `${Math.min(1, cardio.thisWeek / WEEKLY_CARDIO_TARGET_MIN) * 100}%` }]} />
      </View>
      <Text style={styles.cardLine}>
        {cardio.thisWeek >= WEEKLY_CARDIO_TARGET_MIN
          ? 'Weekly guideline met ✓'
          : `${WEEKLY_CARDIO_TARGET_MIN - cardio.thisWeek} min to go`}
      </Text>
      <Text style={styles.cardNote}>
        Met {cardio.metWeeks} of the last 4 weeks · {cardio.gamesThisMonth} football{' '}
        {plural(cardio.gamesThisMonth, 'game')} this month
      </Text>
      <Text style={styles.cardNote}>
        Guideline (WHO): {WEEKLY_CARDIO_TARGET_MIN} min of hard cardio a week, or twice that moderate. Football counts in
        full, other cardio half.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: -SPACE.sm,
    marginBottom: SPACE.xxl,
    marginHorizontal: LAYOUT.screenMargin,
    padding: SPACE.md,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    ...TYPE.row,
  },
  cardLine: {
    marginTop: SPACE.sm,
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.snug,
  },
  cardNote: {
    marginTop: SPACE.sm,
    ...TYPE.small,
    lineHeight: LINE_HEIGHTS.snug,
    color: COLORS.textSecondary,
  },
  cardioMinutes: {
    marginTop: SPACE.sm,
    ...TYPE.displaySemibold,
  },
  cardioUnit: {
    ...TYPE.callout,
    color: COLORS.textSecondary,
  },
  cardioTrack: {
    marginTop: SPACE.sm,
    height: STATISTICS_SIZES.cardioTrackHeight,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },
  cardioFill: {
    height: STATISTICS_SIZES.cardioFillHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
});
