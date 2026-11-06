import { getDb } from '@/db/client';
import type { EditorSet } from '@/types/routine';
import { selectPreviousSetsFor } from './queries';
import type { PreviousSetRow } from './rows';

export async function getPreviousSets(exerciseId: string): Promise<EditorSet[]> {
  return (await getPreviousSetsFor([exerciseId])).get(exerciseId) ?? [];
}

// The PREVIOUS column of several exercises in one query (one per exercise was
// slow): each one's sets from the latest workout with it, by start time, then
// the later of two entries in the same workout. Exercises never done are left out.
export async function getPreviousSetsFor(exerciseIds: string[]): Promise<Map<string, EditorSet[]>> {
  const result = new Map<string, EditorSet[]>();
  const ids = [...new Set(exerciseIds)];
  if (ids.length === 0) return result;
  const db = await getDb();
  const rows = await db.getAllAsync<PreviousSetRow>(selectPreviousSetsFor(ids.length), ids);
  for (const s of rows) {
    if (!result.has(s.exercise_id)) result.set(s.exercise_id, []);
    result.get(s.exercise_id)!.push({
      setType: s.set_type,
      weightKg: s.weight_kg,
      reps: s.reps,
      distanceKm: s.distance_km,
      durationSeconds: s.duration_seconds,
    });
  }
  return result;
}
