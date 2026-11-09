import { StyleSheet, Text, View } from 'react-native';

import { COLORS, DISTRIBUTION_COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { STATISTICS_DISTRIBUTION_SIZES } from '@/constants/sizes';
import { balanceLabel } from '@/lib/training/pushPull';
import { cardStyles } from './cardStyles';
import type { PushPullCardProps } from './types';

// Push against pull in a card: a word,
// a bar split between the two, and both numbers (sets a week).
export function PushPullCard({ push, pull }: PushPullCardProps) {
  const total = push + pull;
  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.cardTitle}>Push / Pull</Text>
      <Text style={cardStyles.cardValue}>{balanceLabel(push, pull)}</Text>
      <View style={styles.split}>
        {total > 0 && <View style={{ flex: push, backgroundColor: DISTRIBUTION_COLORS.push }} />}
        {total > 0 && <View style={{ flex: pull, backgroundColor: DISTRIBUTION_COLORS.pull }} />}
      </View>
      <View style={styles.splitLabels}>
        <Text style={styles.splitText}>
          <Text style={{ color: DISTRIBUTION_COLORS.push }}>Push</Text> {push.toFixed(1)}
        </Text>
        <Text style={styles.splitText}>
          <Text style={{ color: DISTRIBUTION_COLORS.pull }}>Pull</Text> {pull.toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  split: {
    height: STATISTICS_DISTRIBUTION_SIZES.splitHeight,
    marginTop: SPACE.sm,
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: SPACE.xxs,
    backgroundColor: COLORS.separator,
  },
  splitLabels: {
    marginTop: SPACE.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  splitText: {
    ...TYPE.xs,
    color: COLORS.textSecondary,
  },
});
