import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, SPACE } from '@/constants/layout';
import { ICON_SIZES } from '@/constants/sizes';
import { RangeSheet } from './RangeSheet';
import type { ChartHeaderProps } from './types';

// The row above a chart: the shown value on the left, the range button
// ("Last 3 months ⌄") on the right, which opens the range sheet.
export function ChartHeader({ children, ranges, range, onRange }: ChartHeaderProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.row}>
      <Text style={styles.summary} numberOfLines={1}>
        {children}
      </Text>
      <Pressable style={styles.rangeButton} onPress={() => setOpen(true)} hitSlop={HIT_SLOPS.md}>
        <Text style={styles.rangeLabel}>{ranges[range].label}</Text>
        <CaretDown size={ICON_SIZES.xs} weight="bold" color={COLORS.primary} style={styles.caret} />
      </Pressable>
      <RangeSheet visible={open} ranges={ranges} range={range} onPick={onRange} onDismiss={() => setOpen(false)} />
    </View>
  );
}

// The summary of one session (routine and exercise pages): "8,025 kg Oct 23".
export const SESSION_SUMMARY_STYLES = StyleSheet.create({
  value: {
    ...TYPE.rowSemibold,
    lineHeight: LINE_HEIGHTS.normal,
  },
  date: {
    ...TYPE.row,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.primary,
  },
  empty: {
    ...TYPE.row,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
});

const styles = StyleSheet.create({
  row: {
    marginTop: SPACE.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summary: {
    flex: 1,
  },
  rangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeLabel: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.primary,
  },
  caret: {
    marginLeft: SPACE.sm,
    marginRight: SPACE.xxs,
  },
});
