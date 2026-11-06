import { getDb } from '@/db/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { getJson, getStrings, remove, setJson } from '@/db/appState/appState';
import { nextInCycle } from '@/lib/workout/rotation';
import type { Cycle } from '@/types/routine';
import { SELECT_ROUTINE_EXERCISE_NAMES, selectLastCycleWorkout, selectRoutinesIn } from './queries';
import type { CycleRoutineRow, ExerciseNameRow, LastCycleWorkoutRow } from './rows';
import type { Skip } from './types';

// The training cycle (UPPER A → LOWER A → UPPER B → LOWER B → …): routine ids
// in order, saved as one JSON value in app_state. The next routine follows the
// last saved workout from the cycle, matched by title (a workout started from a
// routine takes its name), so missed days and other workouts (Football) don't
// move it. Skip saves which routine comes next instead, valid until the next
// cycle workout is saved.

export async function getRotation(): Promise<string[]> {
  return (await getJson<string[]>(STORAGE_KEYS.rotation)) ?? [];
}

// An empty list turns the cycle off.
export async function saveRotation(ids: string[]): Promise<void> {
  if (ids.length === 0) await remove([STORAGE_KEYS.rotation, STORAGE_KEYS.rotationSkip]);
  else await setJson(STORAGE_KEYS.rotation, ids);
}

// null while no cycle is set.
export async function getCycle(): Promise<Cycle | null> {
  const db = await getDb();
  // The order and the skip in one read.
  const state = await getStrings([STORAGE_KEYS.rotation, STORAGE_KEYS.rotationSkip], db);
  const value = (key: string) => {
    const saved = state.get(key);
    return saved !== undefined ? JSON.parse(saved) : null;
  };
  const saved: string[] = value(STORAGE_KEYS.rotation) ?? [];
  if (saved.length === 0) return null;
  const found = await db.getAllAsync<CycleRoutineRow>(selectRoutinesIn(saved.length), saved);
  const nameOf = new Map(found.map((r) => [r.id, r.name]));
  // A deleted routine just drops out of the cycle.
  const routines = saved.filter((id) => nameOf.has(id)).map((id) => ({ id, name: nameOf.get(id)! }));
  if (routines.length === 0) return null;
  // Only the newest match is read.
  const last = await db.getFirstAsync<LastCycleWorkoutRow>(
    selectLastCycleWorkout(routines.length),
    routines.map((r) => r.name)
  );
  const skip: Skip | null = value(STORAGE_KEYS.rotationSkip);
  const skipped = skip && skip.after === (last?.start_time ?? null) ? routines.findIndex((r) => r.id === skip.id) : -1;
  const next = skipped >= 0 ? skipped : nextInCycle(routines, last?.title ?? null);
  const exercises = await db.getAllAsync<ExerciseNameRow>(SELECT_ROUTINE_EXERCISE_NAMES, [routines[next].id]);
  return {
    routines,
    next,
    nextExercises: exercises.map((e) => e.name),
    last: last ? { title: last.title, startTime: last.start_time } : null,
  };
}

// Shows the routine after the current next one, until a cycle workout is saved.
export async function skipCycle(cycle: Cycle): Promise<void> {
  const skip: Skip = {
    id: cycle.routines[(cycle.next + 1) % cycle.routines.length].id,
    after: cycle.last?.startTime ?? null,
  };
  await setJson(STORAGE_KEYS.rotationSkip, skip);
}
