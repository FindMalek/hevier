import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, SPACE } from '@/constants/layout';
import type { StatProps } from './types';

// A small grey label above a value: "Volume / 8,025 kg".
export const Stat = memo(function Stat({ label, value, size = 'small', blue, icon, onPress, style }: StatProps) {
  const body = (
    <>
      <Text style={[styles.label, LABEL[size]]}>{label}</Text>
      <View style={styles.valueRow}>
        {icon}
        <Text style={[VALUE[size], blue && styles.blue, icon ? styles.afterIcon : null]}>{value}</Text>
      </View>
    </>
  );
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable style={style} onPress={onPress} hitSlop={HIT_SLOPS.md}>
      {body}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  label: {
    lineHeight: LINE_HEIGHTS.compact,
    color: COLORS.textSecondary,
  },
  valueRow: {
    marginTop: SPACE.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  blue: {
    color: COLORS.primary,
  },
  afterIcon: {
    marginLeft: SPACE.xs,
  },
});

const LABEL = StyleSheet.create({
  small: { ...TYPE.xs },
  medium: { ...TYPE.caption },
  large: { ...TYPE.caption },
});

const VALUE = StyleSheet.create({
  small: { ...TYPE.row, lineHeight: LINE_HEIGHTS.normal },
  medium: { ...TYPE.body, lineHeight: LINE_HEIGHTS.normal },
  large: { ...TYPE.title },
});
