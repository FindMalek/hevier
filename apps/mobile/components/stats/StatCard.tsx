import { StyleSheet, Text, View } from 'react-native';
import { ArrowDown } from 'phosphor-react-native/src/icons/ArrowDown';
import { ArrowUp } from 'phosphor-react-native/src/icons/ArrowUp';

import { COLORS, DISTRIBUTION_COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES } from '@/constants/sizes';
import { cardStyles } from './cardStyles';
import type { StatCardProps } from './types';

// A stat card: title, value, and the change from the period before,
// green ↑ when up, grey ↓ when down.
export function StatCard({ title, value, change, format }: StatCardProps) {
  const up = change > 0;
  const tint = up ? DISTRIBUTION_COLORS.up : COLORS.textSecondary;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardTitle}>{title}</Text>
      <Text style={cardStyles.cardValue}>{value}</Text>
      <View style={styles.cardChange}>
        {change !== 0 && <Arrow size={ICON_SIZES.xs} weight="bold" color={tint} />}
        <Text style={[styles.cardChangeText, { color: tint }]}>{format(Math.abs(change))}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardChange: {
    marginTop: SPACE.xxs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.xs,
  },
  cardChangeText: {
    ...TYPE.caption,
  },
});
