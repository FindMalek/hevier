import { memo, useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CaretUp } from 'phosphor-react-native/src/icons/CaretUp';
import { TrashSimple } from 'phosphor-react-native/src/icons/TrashSimple';

import { discardActiveWorkout, useActiveWorkoutSelect, useNow, useUntil } from '@/stores/activeWorkoutStore';
import { ConfirmDialog } from './ConfirmDialog';
import { clock, elapsedLabel } from '@/lib/format/duration';
import { currentExerciseName, elapsedSeconds } from '@/lib/workout/activeWorkout';
import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, WORKOUT_PILL_SIZES } from '@/constants/sizes';
import { secondsUntil } from '@/lib/date';
import type { ActiveWorkout } from '@/types/workout';
import type { PillTimeProps } from './types';

// The floating workout pill: it sits just above the tab bar, over the tab's
// page, while a workout is running. Each tab screen draws it at its bottom
// (Android's native tab bar has no room for it). ^ (or the text) reopens Log
// Workout; the bin discards it after asking. Shows "Rest 02:45" during a rest.
// It only follows what it shows (samePill), so typing in a set doesn't redraw it.
export function WorkoutPill() {
  const router = useRouter();
  const workout = useActiveWorkoutSelect(wholeWorkout, samePill);
  const [discarding, setDiscarding] = useState(false);
  const resting = useUntil(workout?.restEndsAt ?? null);
  const open = useCallback(() => router.push('/log-workout'), [router]);
  if (!workout) return null;
  return (
    <>
      <View style={styles.workoutPill}>
        <Pressable style={styles.pillButton} onPress={open} hitSlop={HIT_SLOPS.xs}>
          <CaretUp size={ICON_SIZES.lg} color={COLORS.text} />
        </Pressable>
        <Pressable style={styles.pillText} onPress={open}>
          <View style={styles.pillTitleRow}>
            <View style={[styles.pillDot, resting && styles.pillDotRest]} />
            <Text style={styles.pillTitle}>{resting ? 'Rest' : 'Workout'} </Text>
            <PillTime workout={workout} resting={resting} />
          </View>
          <Text style={styles.pillExercise} numberOfLines={1}>
            {(resting && workout.restExercise) || currentExerciseName(workout) || workout.title}
          </Text>
        </Pressable>
        <Pressable style={styles.pillButton} onPress={() => setDiscarding(true)} hitSlop={HIT_SLOPS.xs}>
          <TrashSimple size={ICON_SIZES.lg} color={DISCARD_RED} />
        </Pressable>
      </View>
      <ConfirmDialog
        visible={discarding}
        message="Are you sure you want to discard the workout in progress?"
        confirmLabel="Discard Workout"
        onConfirm={() => {
          setDiscarding(false);
          discardActiveWorkout();
        }}
        onCancel={() => setDiscarding(false)}
      />
    </>
  );
}

// The only part that changes every second.
const PillTime = memo(function PillTime({ workout, resting }: PillTimeProps) {
  const now = useNow();
  return (
    <Text style={styles.pillTime}>
      {resting
        ? clock(secondsUntil(workout.restEndsAt ?? now, now))
        : elapsedLabel(elapsedSeconds(workout, now))}
    </Text>
  );
});

function wholeWorkout(workout: ActiveWorkout | null) {
  return workout;
}

// What the pill shows; any other change keeps the copy it already has.
function samePill(a: ActiveWorkout | null, b: ActiveWorkout | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.title === b.title &&
    a.startTime === b.startTime &&
    a.pausedAt === b.pausedAt &&
    a.pausedSeconds === b.pausedSeconds &&
    a.restEndsAt === b.restEndsAt &&
    a.restExercise === b.restExercise &&
    currentExerciseName(a) === currentExerciseName(b)
  );
}

const DISCARD_RED = COLORS.danger;

const styles = StyleSheet.create({
  // 12.4 from the screen edges, 71 tall, 8 above the tab bar (the bottom of the tab screen).
  workoutPill: {
    position: 'absolute',
    left: WORKOUT_PILL_SIZES.workoutPillLeft,
    right: WORKOUT_PILL_SIZES.workoutPillRight,
    bottom: SPACE.sm,
    height: WORKOUT_PILL_SIZES.workoutPillHeight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    elevation: 6,
  },
  pillButton: {
    width: WORKOUT_PILL_SIZES.pillButtonWidth,
    height: WORKOUT_PILL_SIZES.pillButtonHeight,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.raised,
  },
  pillText: {
    flex: 1,
    marginLeft: SPACE.lg,
  },
  pillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACE.xs,
  },
  pillDot: {
    width: WORKOUT_PILL_SIZES.pillDotWidth,
    height: WORKOUT_PILL_SIZES.pillDotHeight,
    borderRadius: RADIUS.pill,
    marginRight: SPACE.md,
    backgroundColor: COLORS.done,
  },
  pillDotRest: {
    backgroundColor: COLORS.primary,
  },
  pillTitle: {
    ...TYPE.calloutSemibold,
  },
  pillTime: {
    ...TYPE.callout,
  },
  pillExercise: {
    marginTop: SPACE.xxs,
    ...TYPE.callout,
    color: COLORS.textSecondary,
  },
});
