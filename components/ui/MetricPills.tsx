import { StyleSheet, View } from 'react-native';
import { SPACE } from '@/constants/layout';
import { Pill } from './Pill';
import type { MetricPillsProps } from './types';

// The row of pills under a chart that picks what it shows (Duration / Volume / Reps).
export function MetricPills<K extends string | number>({ options, value, onChange, wrap, style }: MetricPillsProps<K>) {
  return (
    <View style={[styles.row, wrap && styles.wrap, style]}>
      {options.map((o) => (
        <Pill key={o.key} label={o.label} active={o.key === value} onPress={() => onChange(o.key)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: SPACE.md,
    flexDirection: 'row',
    gap: SPACE.lg,
  },
  wrap: {
    flexWrap: 'wrap',
  },
});
