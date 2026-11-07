import { memo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { SIZES } from '@/constants/sizes';
import type { PillProps } from './types';

// A round-ended choice button: grey, or blue when on.
export const Pill = memo(function Pill({ label, active, onPress }: PillProps) {
  return (
    <Pressable style={[styles.pill, active && styles.active]} onPress={onPress}>
      <Text style={TYPE.body}>{label}</Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pill: {
    height: SIZES.pillHeight,
    paddingHorizontal: SPACE.lg,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  active: {
    backgroundColor: COLORS.primary,
  },
});
