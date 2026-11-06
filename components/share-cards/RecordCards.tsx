import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Fire } from 'phosphor-react-native/src/icons/Fire';

import { COLORS, FONT_SIZES, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SHARE_RECORD_LABELS } from '@/constants/labels';
import { SPACE } from '@/constants/layout';
import { Medal } from '@/components/workout/PrToast';
import { ShareCard } from './ShareCard';
import { recordValue } from './shareCardMaths';
import type { PrCardProps, StreakCardProps } from './types';

// "You've kept up your workouts for 20 weeks running!"
export const StreakCard = memo(function StreakCard({ size, username, weeks }: StreakCardProps) {
  return (
    <ShareCard size={size} username={username} stripes="streak">
      <Fire size={size * 0.17} weight="fill" color={COLORS.streak} />
      <Text style={styles.huge}>{weeks}</Text>
      <Text style={styles.headline}>Week Streak</Text>
      <Text style={styles.line}>
        {weeks === 1
          ? 'Your streak starts this week. Keep it going next week!'
          : `You've kept up your workouts for ${weeks} weeks running!`}
      </Text>
    </ShareCard>
  );
});

// "148.15 kg · Iso-Lateral Low Row · Best One Rep Max"
export const PrCard = memo(function PrCard({ size, username, record }: PrCardProps) {
  return (
    <ShareCard size={size} username={username} stripes="pr">
      <Medal size={size * 0.17} label="PR" />
      <Text style={[styles.huge, styles.prValue]} numberOfLines={1} adjustsFontSizeToFit>
        {recordValue(record.kind, record.value)}
      </Text>
      <Text style={styles.headline} numberOfLines={2}>
        {record.name}
      </Text>
      <Text style={styles.line}>{SHARE_RECORD_LABELS[record.kind]}</Text>
    </ShareCard>
  );
});

const styles = StyleSheet.create({
  huge: {
    marginTop: SPACE.xs,
    ...TYPE.hugeBold,
    lineHeight: LINE_HEIGHTS.huge,
  },
  prValue: {
    fontSize: FONT_SIZES.hero,
    lineHeight: LINE_HEIGHTS.hero,
  },
  headline: {
    ...TYPE.largeTitleBold,
  },
  line: {
    marginTop: SPACE.sm,
    ...TYPE.row,
    lineHeight: LINE_HEIGHTS.normal,
  },
});
