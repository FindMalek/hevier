import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { COLORS, TYPE } from '@/constants/theme';
import type { SetType } from '@/types/workout';
import type { SetBadgeProps } from './types';

// The SET column of a set row: W (orange), F (red) or the set's number.
export const SetBadge = memo(function SetBadge({ setType, label, style }: SetBadgeProps) {
  return <Text style={[styles.number, setBadgeColor(setType), style]}>{label}</Text>;
});

// The colour of a warm-up or failure set's badge; null for the others.
export function setBadgeColor(t: SetType) {
  return t === 'failure' ? styles.failure : t === 'warmup' ? styles.warmup : null;
}

const styles = StyleSheet.create({
  number: {
    ...TYPE.rowSemibold,
  },
  warmup: {
    color: COLORS.warmup,
  },
  failure: {
    color: COLORS.danger,
  },
});
