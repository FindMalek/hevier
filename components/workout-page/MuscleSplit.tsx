import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { WORKOUT_PAGE_SIZES } from '@/constants/sizes';
import { WORKOUT_PAGE_LIMITS } from '@/constants/limits';
import { shared } from './styles';
import type { MuscleSplitProps } from './types';

// The Muscle Split: the top 3 body parts,
// bars sized against the biggest one, "Show N more" opens the rest.
export const MuscleSplit = memo(function MuscleSplit({ split }: MuscleSplitProps) {
  const [all, setAll] = useState(false);
  const shown = all ? split : split.slice(0, WORKOUT_PAGE_LIMITS.shownSplitParts);
  const top = split[0].percent || 1;
  return (
    <View>
      <Text style={shared.section}>Muscle Split</Text>
      {shown.map(({ part, percent }) => (
        <View key={part} style={styles.splitRow}>
          <Text style={styles.splitLabel}>{part}</Text>
          <View style={styles.splitBarRow}>
            <View style={[styles.splitBar, { width: `${(percent / top) * 80}%` }]} />
            <Text style={styles.splitPercent}>{percent}%</Text>
          </View>
        </View>
      ))}
      {!all && split.length > WORKOUT_PAGE_LIMITS.shownSplitParts && (
        <Pressable onPress={() => setAll(true)} hitSlop={HIT_SLOPS.md}>
          <Text style={styles.showMore}>Show {split.length - WORKOUT_PAGE_LIMITS.shownSplitParts} more</Text>
        </Pressable>
      )}
      <View style={shared.divider} />
    </View>
  );
});

const styles = StyleSheet.create({
  splitRow: {
    marginTop: SPACE.md,
  },
  splitLabel: {
    ...TYPE.row,
  },
  splitBarRow: {
    marginTop: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitBar: {
    height: WORKOUT_PAGE_SIZES.splitBarHeight,
    minWidth: WORKOUT_PAGE_SIZES.splitBarMinWidth,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  splitPercent: {
    marginLeft: SPACE.sm,
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  showMore: {
    marginTop: SPACE.md,
    ...TYPE.row,
    color: COLORS.primary,
  },
});
