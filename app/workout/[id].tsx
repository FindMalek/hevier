import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { InnerHeader } from '@/components/ui/InnerHeader';
import { MediaStrip } from '@/components/workout/MediaStrip';
import { MoreButton } from '@/components/routines/RoutineList';
import { WorkoutSummary } from '@/components/workout/WorkoutCard';
import { useWorkoutMenu } from '@/components/workout/WorkoutMenu';
import { Screen } from '@/components/ui/Screen';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import { MuscleSplit } from '@/components/workout-page/MuscleSplit';
import { WorkoutExerciseBlock } from '@/components/workout-page/WorkoutExerciseBlock';
import { shared } from '@/components/workout-page/styles';
import { LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { getWorkoutCard } from '@/db/feed/cards';
import { getProfileNames } from '@/db/profile/names';
import { getStatSets } from '@/db/stats/statSets';
import { muscleSplit } from '@/lib/stats/stats';
import { longDateTime } from '@/lib/format/date';
import type { WorkoutCardData } from '@/types/feed';
import type { SplitPart } from '@/types/stats';

// A saved workout, opened from a card on Home or the Profile: the card's summary, the muscle
// split, then each exercise with its sets (components/workout-page/).
export default function WorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutCardData | null>(null);
  const [profile, setProfile] = useState<{ name: string; username: string } | null>(null);
  const [split, setSplit] = useState<SplitPart[]>([]);
  const { openMenu, menu } = useWorkoutMenu(() => router.back());
  const openExercise = useCallback((exerciseId: string) => router.push(`/exercises/${exerciseId}`), [router]);

  useFocusEffect(
    useCallback(() => {
      getProfileNames().then(setProfile);
      if (!id) return;
      getWorkoutCard(id).then(setWorkout);
      getStatSets().then((sets) => setSplit(muscleSplit(sets.filter((s) => s.workoutId === id))));
    }, [id])
  );

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader
        title="Workout Detail"
        right={
          workout && (
            <View style={styles.more}>
              <MoreButton onPress={() => openMenu(workout.id)} />
            </View>
          )
        }
      />
      {workout && profile && (
        <ScrollView contentContainerStyle={[SCREEN_STYLES.content, styles.contentTop]}>
          <WorkoutSummary workout={workout} username={profile.username} name={profile.name} when={longDateTime(new Date(workout.startTime))} />
          {/* What was written and added on the Save Workout page. */}
          {!!workout.description && <Text style={styles.description}>{workout.description}</Text>}
          {!!workout.media?.length && (
            <View style={styles.media}>
              <MediaStrip media={workout.media} />
            </View>
          )}
          <View style={shared.divider} />
          {split.length > 0 && <MuscleSplit split={split} />}
          <Text style={shared.section}>Workout</Text>
          {workout.exercises.map((e, i) => (
            <WorkoutExerciseBlock key={i} exercise={e} onOpen={openExercise} />
          ))}
        </ScrollView>
      )}
      {menu}
    </Screen>
  );
}

const styles = StyleSheet.create({
  more: {
    paddingRight: SPACE.lg,
  },
  contentTop: {
    paddingTop: SPACE.lg,
  },
  description: {
    marginTop: SPACE.sm,
    marginHorizontal: LAYOUT.screenMargin,
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.normal,
  },
  media: {
    marginTop: SPACE.md,
    paddingHorizontal: LAYOUT.screenMargin,
  },
});
