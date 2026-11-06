import { updateActiveWorkout } from '@/stores/activeWorkoutStore';
import { parseClock } from '@/lib/format/setFormat';
import { patchSet, removeByKey, updateByKey } from '@/components/set-table/draftOps';
import { nextSetLike, orderByKeys } from '@/lib/workout/activeWorkout';
import type { ActiveExercise, ActiveSet } from '@/types/workout';

// Changes to the live workout, by exercise / set key. Module-level on purpose:
// the row callbacks built from them never change (see ExerciseActions).

export function updateExercise(key: string, change: (e: ActiveExercise) => ActiveExercise) {
  updateActiveWorkout((w) => ({ ...w, exercises: updateByKey(w.exercises, key, change) }));
}

export function updateSet(exerciseKey: string, setKey: string, change: Partial<ActiveSet>) {
  updateExercise(exerciseKey, (e) => ({ ...e, sets: patchSet(e.sets, setKey, change) }));
}

export function removeSet(exerciseKey: string, setKey: string) {
  updateExercise(exerciseKey, (e) => ({ ...e, sets: removeByKey(e.sets, setKey) }));
}

// Add Set copies the set above it.
export function addSet(exerciseKey: string) {
  updateExercise(exerciseKey, (e) => ({ ...e, sets: [...e.sets, nextSetLike(e.sets)] }));
}

export function removeExercise(exerciseKey: string) {
  updateActiveWorkout((w) => ({ ...w, exercises: removeByKey(w.exercises, exerciseKey) }));
}

export function reorderExercises(keys: string[]) {
  updateActiveWorkout((w) => ({ ...w, exercises: orderByKeys(w.exercises, keys) }));
}

// ▶ on a TIME box: count its time down.
export function playSet(setKey: string, time: string) {
  const seconds = parseClock(time);
  if (!seconds) return;
  updateActiveWorkout((w) => ({ ...w, setTimer: { setKey, endsAt: Date.now() + seconds * 1000 } }));
}

export function stopSetTimer() {
  updateActiveWorkout((w) => ({ ...w, setTimer: null }));
}
