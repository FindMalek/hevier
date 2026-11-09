import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { skipRest, useNow } from '@/stores/activeWorkoutStore';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { LOG_WORKOUT_SIZES } from '@/constants/sizes';
import { clock } from '@/lib/format/duration';
import { secondsUntil } from '@/lib/date';
import type { RestBarProps } from './types';

// Countdown after a completed set: −15 / time / +15 / Skip, with a blue line
// showing the time left (log-workout-rest-timer.jpg).
export const RestBar = memo(function RestBar({ restEndsAt, restTotal, insetBottom, onAdjust }: RestBarProps) {
  const now = useNow();
  const left = secondsUntil(restEndsAt ?? now, now);
  const fraction = restTotal ? Math.min(1, left / restTotal) : 0;
  return (
    <View style={[styles.bar, { paddingBottom: insetBottom + 8 }]}>
      <View style={styles.line}>
        <View style={[styles.lineFill, { width: `${fraction * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <Pressable style={styles.button} onPress={() => onAdjust(-15)}>
          <Text style={TYPE.bodyMedium}>-15</Text>
        </Pressable>
        <Text style={styles.time}>{clock(left)}</Text>
        <Pressable style={styles.button} onPress={() => onAdjust(15)}>
          <Text style={TYPE.bodyMedium}>+15</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.skip]} onPress={skipRest}>
          <Text style={TYPE.bodyMedium}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
  },
  line: {
    height: LOG_WORKOUT_SIZES.restLineHeight,
    backgroundColor: COLORS.background,
  },
  lineFill: {
    height: LOG_WORKOUT_SIZES.restLineFillHeight,
    backgroundColor: COLORS.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LAYOUT.screenMargin,
    paddingTop: SPACE.sm,
    gap: SPACE.md,
  },
  button: {
    height: LOG_WORKOUT_SIZES.restButtonHeight,
    minWidth: LOG_WORKOUT_SIZES.restButtonMinWidth,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.button,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.separator,
  },
  time: {
    flex: 1,
    textAlign: 'center',
    ...TYPE.timerMedium,
  },
  skip: {
    minWidth: LOG_WORKOUT_SIZES.skipMinWidth,
    backgroundColor: COLORS.primary,
  },
});
