import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { volumeLabel } from '@/lib/format/weight';
import { ShareCard } from './ShareCard';
import type { WeightCardProps } from './types';

// "You lifted a total of 7,530 kg / That's like lifting a T-rex!"
export const WeightCard = memo(function WeightCard({ size, username, workout, comparison }: WeightCardProps) {
  return (
    <ShareCard size={size} username={username} centered footer>
      <Text style={styles.weightIntro}>You lifted a total of</Text>
      <Text style={styles.weightValue}>{volumeLabel(workout.volumeKg)}</Text>
      <Text style={styles.weightLine}>{comparison.line}</Text>
      <Text style={[styles.weightPicture, { fontSize: size * 0.3, lineHeight: size * 0.38 }]}>{comparison.emoji}</Text>
    </ShareCard>
  );
});

const styles = StyleSheet.create({
  weightIntro: {
    ...TYPE.headlineSemibold,
  },
  weightValue: {
    ...TYPE.heroBold,
    lineHeight: LINE_HEIGHTS.hero,
  },
  weightLine: {
    ...TYPE.row,
  },
  weightPicture: {
    marginTop: SPACE.md,
    textAlign: 'center',
  },
});
