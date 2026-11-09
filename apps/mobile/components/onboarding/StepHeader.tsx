import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { ONBOARDING_SIZES } from '@/constants/sizes';
import type { StepHeaderProps } from './types';

// One bar per question (blue up to this one), and Skip on the right.
export function StepHeader({ step, steps, onSkip }: StepHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.bars}>
        {Array.from({ length: steps }, (_, i) => (
          <View key={i} style={[styles.bar, i <= step && styles.barOn]} />
        ))}
      </View>
      <Pressable hitSlop={HIT_SLOPS.md} onPress={onSkip}>
        <Text style={styles.skip}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenMargin,
    paddingVertical: SPACE.md,
    gap: SPACE.lg,
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  bar: {
    flex: 1,
    height: ONBOARDING_SIZES.progressHeight,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.separator,
  },
  barOn: {
    backgroundColor: COLORS.primary,
  },
  skip: {
    ...TYPE.bodyMedium,
    color: COLORS.textSecondary,
  },
});
