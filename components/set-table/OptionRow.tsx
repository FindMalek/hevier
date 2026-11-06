import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, SPACE } from '@/constants/layout';
import { SIZES } from '@/constants/sizes';
import type { OptionRowProps } from './types';

// A blue icon + text row under an exercise's name: "⏱ Rest Timer: 2min 0s", "⇄ Weight: Per hand".
export const OptionRow = memo(function OptionRow({ icon, label, onPress, style }: OptionRowProps) {
  const content = (
    <>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </>
  );
  if (!onPress) return <View style={[styles.row, style]}>{content}</View>;
  return (
    <Pressable style={[styles.row, styles.tappable, style]} onPress={onPress} hitSlop={HIT_SLOPS.sm}>
      {content}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: SIZES.restRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // In the editors the row sits under the notes, as wide as its text.
  tappable: {
    marginTop: SPACE.lg,
    marginLeft: SPACE.lg,
    alignSelf: 'flex-start',
  },
  label: {
    marginLeft: SPACE.sm,
    ...TYPE.body,
    color: COLORS.primary,
  },
});
