import { StyleSheet, View } from 'react-native';
import { useNow } from '@/stores/activeWorkoutStore';
import { Stat } from '@/components/ui/Stat';
import { SPACE } from '@/constants/layout';
import { LOG_WORKOUT_SIZES } from '@/constants/sizes';
import { elapsedLabel } from '@/lib/format/duration';
import { volumeLabel } from '@/lib/format/weight';
import { elapsedSeconds, workoutStats } from '@/lib/workout/activeWorkout';
import type { DurationStatProps, WorkoutStatsRowProps } from './types';

// Duration · Volume · Sets above the exercises.
export function WorkoutStatsRow({ workout, onDuration }: WorkoutStatsRowProps) {
  const stats = workoutStats(workout);
  return (
    <View style={styles.row}>
      <DurationStat workout={workout} onPress={onDuration} />
      <Stat label="Volume" value={volumeLabel(stats.volumeKg)} style={styles.stat} />
      <Stat label="Sets" value={String(stats.sets)} style={styles.stat} />
    </View>
  );
}

// The only part of the page that changes every second (with the rest bar and a
// ▶ countdown), so it ticks on its own.
function DurationStat({ workout, onPress }: DurationStatProps) {
  const now = useNow();
  return <Stat label="Duration" value={elapsedLabel(elapsedSeconds(workout, now))} blue onPress={onPress} style={styles.stat} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.lg,
    paddingLeft: SPACE.lg,
  },
  stat: {
    width: LOG_WORKOUT_SIZES.statWidth,
  },
});
