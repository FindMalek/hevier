import { getDb } from '@/db/client';
import { exerciseBests } from '@/lib/stats/records';
import type { Bests } from '@/types/records';
import { selectSetsOfExercises } from './queries';
import type { ExerciseSetRow } from './rows';

// The bests of an exercise over all saved workouts; null when it was never done,
// so the first time is not a record (every set would be one).
export async function getExerciseBests(exerciseId: string): Promise<Bests | null> {
  return (await getExerciseBestsFor([exerciseId])).get(exerciseId) ?? null;
}

// The same for several exercises in one query (starting a routine asked once
// per exercise). Exercises never done are left out.
export async function getExerciseBestsFor(exerciseIds: string[]): Promise<Map<string, Bests>> {
  const ids = [...new Set(exerciseIds)];
  if (ids.length === 0) return new Map();
  const db = await getDb();
  const rows = await db.getAllAsync<ExerciseSetRow>(selectSetsOfExercises(ids.length), ids);
  return exerciseBests(
    rows.map((r) => ({
      exerciseId: r.exercise_id,
      setType: r.set_type,
      weightKg: r.weight_kg,
      reps: r.reps,
      durationSeconds: r.duration_seconds,
      distanceKm: r.distance_km,
    }))
  );
}
