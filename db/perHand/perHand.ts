import { getDb } from '@/db/client';
import { STORAGE_KEYS } from '@/constants/storage';
import { getJson, remove, setJson } from '@/db/appState/appState';
import { canLogPerHand } from '@/lib/perHand';
import type { PerHand } from '@/types/perHand';
import { SELECT_DUMBBELL_EXERCISES } from './queries';
import type { DumbbellExerciseRow } from './rows';

// Dumbbell weight per hand: on the exercises the user switched (tap KG in Log
// Workout or the routine editor), the KG box shows and takes one dumbbell and
// the set keeps the total, as the history always did (Bench Press (Dumbbell)
// 60 = two 30s). Saved as the list of switched exercise ids in app_state.

export async function getPerHand(): Promise<PerHand> {
  const db = await getDb();
  const [rows, saved] = await Promise.all([
    db.getAllAsync<DumbbellExerciseRow>(SELECT_DUMBBELL_EXERCISES),
    getJson<string[]>(STORAGE_KEYS.perHand, db),
  ]);
  return {
    eligible: rows.filter((r) => canLogPerHand(r.name, r.equipment)).map((r) => r.id),
    on: saved ?? [],
  };
}

export async function savePerHand(ids: string[]): Promise<void> {
  if (ids.length === 0) await remove(STORAGE_KEYS.perHand);
  else await setJson(STORAGE_KEYS.perHand, ids);
}
