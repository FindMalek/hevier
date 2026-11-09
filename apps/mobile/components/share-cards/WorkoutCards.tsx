import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES } from '@/constants/sizes';
import { SHARE_CARDS_LIMITS } from '@/constants/limits';
import { durationLabel } from '@/lib/format/feed';
import { volumeLabel } from '@/lib/format/weight';
import { plural } from '@/lib/format/text';
import { Medal } from '@/components/workout/PrToast';
import { ShareCard, Wordmark } from './ShareCard';
import { exerciseLines } from './shareCardMaths';
import { shared } from './styles';
import type { CardStatProps, WorkoutCardProps } from './types';

// The cards that are only numbers and names: Summary, Stats and Minimal.

function Stat({ label, value, medal, big }: CardStatProps) {
  return (
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <View style={shared.statRow}>
        <Text style={big ? styles.statBig : styles.statValue}>{value}</Text>
        {medal && <Medal size={big ? 22 : 18} />}
      </View>
    </View>
  );
}

function BigStat({ value, label, medal }: CardStatProps) {
  return (
    <View>
      <View style={shared.statRow}>
        <Text style={styles.statBig}>{value}</Text>
        {medal && <Medal size={ICON_SIZES.lg} />}
      </View>
      <Text style={styles.bigLabel}>{label}</Text>
    </View>
  );
}

// Title, Duration / Volume / Records, then "1x Warm Up" … "…and 2 more exercises".
export const SummaryCard = memo(function SummaryCard({ size, username, workout }: WorkoutCardProps) {
  const { shown, more } = exerciseLines(workout.exercises, SHARE_CARDS_LIMITS.summaryExercises);
  return (
    <ShareCard size={size} username={username}>
      <Text style={styles.title} numberOfLines={1}>
        {workout.title}
      </Text>
      <View style={styles.statsRow}>
        <Stat label="Duration" value={durationLabel(workout.durationSeconds)} />
        <Stat label="Volume" value={volumeLabel(workout.volumeKg)} />
        <Stat label="Records" value={String(workout.records)} medal={workout.records > 0} />
      </View>
      <View style={styles.list}>
        {shown.map((e, i) => (
          <Text key={i} style={styles.listLine} numberOfLines={1}>
            <Text style={shared.count}>{e.sets.length}x </Text>
            {e.name}
          </Text>
        ))}
        {more > 0 && (
          <Text style={shared.listMore}>
            ...and {more} more {plural(more, 'exercise')}
          </Text>
        )}
      </View>
    </ShareCard>
  );
});

// Big numbers: Duration, Volume, Exercises, Records.
export const StatsCard = memo(function StatsCard({ size, username, workout }: WorkoutCardProps) {
  return (
    <ShareCard size={size} username={username}>
      <Text style={styles.title} numberOfLines={1}>
        {workout.title}
      </Text>
      <View style={styles.grid}>
        <View style={styles.cell}>
          <BigStat value={durationLabel(workout.durationSeconds)} label="Duration" />
        </View>
        <View style={styles.cell}>
          <BigStat value={volumeLabel(workout.volumeKg)} label="Volume" />
        </View>
        <View style={styles.cell}>
          <BigStat value={String(workout.exercises.length)} label="Exercises" />
        </View>
        <View style={styles.cell}>
          <BigStat value={String(workout.records)} label="Records" medal={workout.records > 0} />
        </View>
      </View>
    </ShareCard>
  );
});

// Centred: Duration, Volume, Records, then the wordmark and @name.
export const MinimalCard = memo(function MinimalCard({ size, username, workout }: WorkoutCardProps) {
  return (
    <ShareCard size={size} username={username} centered>
      <Text style={styles.minimalValue}>{durationLabel(workout.durationSeconds)}</Text>
      <Text style={styles.minimalLabel}>Duration</Text>
      <Text style={styles.minimalValue}>{volumeLabel(workout.volumeKg)}</Text>
      <Text style={styles.minimalLabel}>Volume</Text>
      <View style={shared.statRow}>
        <Text style={styles.minimalValue}>{workout.records}</Text>
        {workout.records > 0 && <Medal size={ICON_SIZES.sm} />}
      </View>
      <Text style={styles.minimalLabel}>Records</Text>
      <View style={styles.minimalFooter}>
        <Wordmark />
        <Text style={styles.minimalUser}>@{username}</Text>
      </View>
    </ShareCard>
  );
});

const styles = StyleSheet.create({
  title: {
    ...TYPE.headlineSemibold,
  },
  statsRow: {
    marginTop: SPACE.md,
    flexDirection: 'row',
    gap: SPACE.xl,
  },
  statLabel: {
    ...TYPE.caption,
  },
  statValue: {
    ...TYPE.bodySemibold,
  },
  statBig: {
    ...TYPE.displaySemibold,
  },
  bigLabel: {
    ...TYPE.small,
  },
  list: {
    marginTop: SPACE.lg,
    gap: SPACE.sm,
  },
  listLine: {
    ...TYPE.callout,
  },
  grid: {
    marginTop: SPACE.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACE.xl,
  },
  cell: {
    width: '50%',
  },
  minimalValue: {
    ...TYPE.titleSemibold,
  },
  minimalLabel: {
    marginBottom: SPACE.sm,
    ...TYPE.small,
  },
  minimalFooter: {
    marginTop: SPACE.md,
    alignItems: 'center',
  },
  minimalUser: {
    marginTop: SPACE.xxs,
    ...TYPE.small,
  },
});
