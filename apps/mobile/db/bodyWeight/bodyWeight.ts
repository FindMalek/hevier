import * as Crypto from 'expo-crypto';
import { getDb } from '@/db/client';
import { invalidateHistory } from '@/db/historyCache';
import type { BodyWeightContext, BodyWeightEntry } from '@/types/bodyWeight';
import { DELETE_BODY_WEIGHT, INSERT_BODY_WEIGHT, SELECT_BODY_WEIGHTS, SELECT_BODY_WEIGHT_EXERCISE_IDS } from './queries';
import type { BodyWeightRow, ExerciseIdRow } from './rows';

// Profile → Body weight, and the Save Workout question when none is logged.
// Every volume (workout cards, Profile, statistics) counts these for body weight
// exercises, so each change refreshes the history.

export async function getBodyWeights(): Promise<BodyWeightEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<BodyWeightRow>(SELECT_BODY_WEIGHTS);
  return rows.map((r) => ({ id: r.id, loggedAt: r.logged_at, weightKg: r.weight_kg }));
}

export async function addBodyWeight(weightKg: number, at = new Date()): Promise<void> {
  const db = await getDb();
  await db.runAsync(INSERT_BODY_WEIGHT, [Crypto.randomUUID(), at.toISOString(), weightKg]);
  invalidateHistory();
}

export async function deleteBodyWeight(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(DELETE_BODY_WEIGHT, [id]);
  invalidateHistory();
}

export async function getBodyWeightContext(): Promise<BodyWeightContext> {
  const db = await getDb();
  const [weights, ids] = await Promise.all([
    db.getAllAsync<BodyWeightRow>(SELECT_BODY_WEIGHTS),
    db.getAllAsync<ExerciseIdRow>(SELECT_BODY_WEIGHT_EXERCISE_IDS),
  ]);
  return { weightKg: weights[0]?.weight_kg ?? null, exerciseIds: new Set(ids.map((r) => r.id)) };
}
