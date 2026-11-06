import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { MUSCLE_BARS_SIZES } from '@/constants/sizes';
import { plural } from '@/lib/format/text';
import { EmptyState } from '@/components/ui/EmptyState';
import type { MuscleBarsProps } from './types';

// Muscle groups as horizontal bars with their set counts (Statistics screens).
// Hard sets have decimals (an easy set counts less), shown to one decimal, and
// can colour each bar.
export function MuscleBars({
  counts,
  limit,
  colorOf,
}: MuscleBarsProps) {
  const shown = limit ? counts.slice(0, limit) : counts;
  const max = Math.max(1, ...shown.map((c) => c.sets));
  if (shown.length === 0) return <EmptyState message="No sets in this period" />;
  return (
    <View>
      {shown.map((c) => {
        const n = Math.round(c.sets * 10) / 10;
        return (
          <View key={c.muscle} style={styles.row}>
            <View style={styles.labels}>
              <Text style={styles.muscle}>{c.muscle}</Text>
              <Text style={styles.count}>
                {n} {plural(n, 'set')}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[styles.bar, { width: `${(c.sets / max) * 100}%` }, colorOf && { backgroundColor: colorOf(c.sets) }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: SPACE.md,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  muscle: {
    ...TYPE.body,
  },
  count: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  track: {
    height: MUSCLE_BARS_SIZES.trackHeight,
    marginTop: SPACE.xs,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  bar: {
    height: MUSCLE_BARS_SIZES.barHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
});
