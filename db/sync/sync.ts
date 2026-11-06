import * as Crypto from 'expo-crypto';
import { getDb } from '@/db/client';
import { transactionsDone } from '@/db/transaction';
import { STORAGE_KEYS } from '@/constants/storage';
import { getString, insertString } from '@/db/appState/appState';
import { COUNT_WORKOUTS, VACUUM_INTO } from './queries';
import type { WorkoutCountRow } from './rows';

// What the phone sends to the PC with each copy (lib/sync/client.ts).

// Which phone a copy came from. Kept in the database itself, so a phone
// restored from the PC carries on as the same phone.
export async function getDeviceId(): Promise<string> {
  const saved = await getString(STORAGE_KEYS.syncDeviceId);
  if (saved !== null) return saved;
  const id = Crypto.randomUUID();
  await insertString(STORAGE_KEYS.syncDeviceId, id);
  return id;
}

export async function countWorkouts(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<WorkoutCountRow>(COUNT_WORKOUTS);
  return row?.n ?? 0;
}

// A consistent copy of the open database at destPath (a plain path, not a
// file:// URI). Waits for a save under way to finish first.
export async function makeSnapshot(destPath: string): Promise<void> {
  await transactionsDone();
  const db = await getDb();
  await db.runAsync(VACUUM_INTO, [destPath]);
}
