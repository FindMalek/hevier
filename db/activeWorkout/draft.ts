import { STORAGE_KEYS } from '@/constants/storage';
import { getJson, remove, setJson } from '@/db/appState/appState';
import { getExerciseBestsFor } from '@/db/records/bests';
import { bestsOf } from '@/lib/workout/activeWorkout';
import type { ActiveWorkout } from '@/types/workout';

// The workout being logged right now. It is a draft, saved after every change
// (app_state 'activeWorkout'), so leaving the screen or closing the app never
// loses it. Only Finish (db/workouts/write.ts) turns it into a real workout,
// keeping the completed sets; Discard deletes it.

export async function loadActiveWorkout(): Promise<ActiveWorkout | null> {
  const workout = await getJson<ActiveWorkout>(STORAGE_KEYS.activeWorkout);
  if (!workout) return null;
  const missing = workout.exercises.filter((e) => e.bests === undefined);
  if (missing.length > 0) {
    const bests = await getExerciseBestsFor(missing.map((e) => e.exerciseId));
    for (const e of missing) e.bests = bestsOf(bests, e.exerciseId);
  }
  return workout;
}

export async function saveActiveWorkout(workout: ActiveWorkout): Promise<void> {
  await setJson(STORAGE_KEYS.activeWorkout, workout);
}

export async function clearActiveWorkout(): Promise<void> {
  await remove(STORAGE_KEYS.activeWorkout);
}
