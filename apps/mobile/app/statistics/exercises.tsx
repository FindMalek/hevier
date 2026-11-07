import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { ExerciseThumb } from '@/components/exercises/ExerciseThumb';
import { InnerHeader } from '@/components/ui/InnerHeader';
import { COLORS, TYPE } from '@/constants/theme';
import { getStatSets } from '@/db/stats/statSets';
import { mainExercises } from '@/lib/stats/stats';
import { LAYOUT, SPACE } from '@/constants/layout';
import { STATISTICS_EXERCISES_SIZES } from '@/constants/sizes';
import { plural } from '@/lib/format/text';
import type { MainExercise } from '@/types/stats';
import { Screen } from '@/components/ui/Screen';

// Statistics → Main exercises: every exercise
// done, most workouts first, laid out like the exercise list; tapping one
// opens its exercise page.
export default function MainExercisesScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<MainExercise[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStatSets().then((sets) => setExercises(mainExercises(sets)));
    }, [])
  );

  const renderItem = useCallback(
    ({ item, index }: { item: MainExercise; index: number }) => (
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={() => router.push(`/exercises/${item.exerciseId}`)}>
        <ExerciseThumb catalogueId={item.catalogueId} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.detail}>
            {item.workouts} {plural(item.workouts, 'workout')} · {item.sets} sets
          </Text>
        </View>
        <Text style={styles.rank}>#{index + 1}</Text>
      </Pressable>
    ),
    [router]
  );

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Main Exercises" />
      <FlatList
        data={exercises ?? []}
        keyExtractor={exerciseKey}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        // Rows are a fixed 64 tall.
        getItemLayout={rowLayout}
      />
    </Screen>
  );
}

function exerciseKey(e: MainExercise) {
  return e.exerciseId;
}

function rowLayout(_: unknown, index: number) {
  return { length: 64, offset: 64 * index, index };
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: SPACE.xxxl,
  },
  row: {
    height: STATISTICS_EXERCISES_SIZES.rowHeight,
    paddingHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    flex: 1,
    marginLeft: SPACE.lg,
  },
  name: {
    ...TYPE.bodyMedium,
  },
  detail: {
    marginTop: SPACE.xxs,
    ...TYPE.small,
    color: COLORS.textSecondary,
  },
  rank: {
    ...TYPE.small,
    color: COLORS.textSecondary,
  },
});
