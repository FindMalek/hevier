import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Barbell } from 'phosphor-react-native/src/icons/Barbell';
import { Check } from 'phosphor-react-native/src/icons/Check';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES, SIZES } from '@/constants/sizes';
import { SET_COLUMNS, valueColumn } from './columns';
import { slotsOf } from './fields';
import type { SetTableHeaderProps } from './types';

// SET  PREVIOUS  KG  REPS  (✓ in Log Workout), above an exercise's sets.
export const SetTableHeader = memo(function SetTableHeader({ fields, perHand, layout, style }: SetTableHeaderProps) {
  const c = SET_COLUMNS[layout];
  return (
    <View style={[styles.header, style]}>
      <Text style={[styles.cell, c.set]}>SET</Text>
      <Text style={[styles.cell, c.previous]}>PREVIOUS</Text>
      {slotsOf(fields).map((f, i) => (
        <View key={i} style={[valueColumn(layout, i, fields.length), styles.label]}>
          {f?.field === 'weight' && <Barbell size={ICON_SIZES.xs} color={COLORS.textSecondary} style={styles.unitIcon} />}
          <Text style={styles.cell}>{f?.field === 'weight' && perHand ? 'KG/HAND' : f?.label}</Text>
        </View>
      ))}
      {layout === 'log' && (
        <View style={[c.check, styles.label]}>
          <Check size={ICON_SIZES.md} color={COLORS.textSecondary} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    marginTop: SPACE.md,
    height: SIZES.tableHeaderHeight,
  },
  cell: {
    ...TYPE.caption,
    lineHeight: LINE_HEIGHTS.compact,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  label: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: LINE_HEIGHTS.compact,
  },
  unitIcon: {
    marginRight: SPACE.xs,
  },
});
