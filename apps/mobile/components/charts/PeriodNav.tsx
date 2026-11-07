import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CaretLeft } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS } from '@/constants/layout';
import { ICON_SIZES, PERIOD_NAV_SIZES } from '@/constants/sizes';
import type { PeriodNavProps } from './types';

// "‹ October 2026 ›": steps a Statistics screen through weeks or months.
export function PeriodNav({
  label,
  onPrevious,
  onNext,
}: PeriodNavProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrevious} disabled={!onPrevious} hitSlop={HIT_SLOPS.xl}>
        <CaretLeft size={ICON_SIZES.lg} weight="bold" color={onPrevious ? COLORS.primary : COLORS.separator} />
      </Pressable>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={onNext} disabled={!onNext} hitSlop={HIT_SLOPS.xl}>
        <CaretRight size={ICON_SIZES.lg} weight="bold" color={onNext ? COLORS.primary : COLORS.separator} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: PERIOD_NAV_SIZES.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...TYPE.titleSemibold,
  },
});
