import { getDb } from '@/db/client';
import { transactionsDone } from '@/db/transaction';
import { COUNT_WORKOUTS, SELECT_LAST_WORKOUT_START, VACUUM_INTO } from './queries';
import type { LastWorkoutRow, WorkoutCountRow } from './rows';

// What the phone sends to the PC with each copy (lib/sync/client.ts).

export async function countWorkouts(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<WorkoutCountRow>(COUNT_WORKOUTS);
  return row?.n ?? 0;
}

export async function lastWorkoutStart(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<LastWorkoutRow>(SELECT_LAST_WORKOUT_START);
  return row?.start_time ?? null;
}

// A consistent copy of the open database at destPath (a plain path, not a
// file:// URI). Waits for a save under way to finish first.
export async function makeSnapshot(destPath: string): Promise<void> {
  await transactionsDone();
  const db = await getDb();
  await db.runAsync(VACUUM_INTO, [destPath]);
}
