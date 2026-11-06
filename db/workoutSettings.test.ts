import { beforeEach, describe, expect, it, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { runMigrations } from './migrations';
import { DEFAULT_WORKOUT_SETTINGS } from '@/constants/defaults';

// workoutSettings.ts on an in-memory sql.js database, as in db/workouts/edit.test.ts.
let raw: Database;

function rows<T>(sqlText: string, params: unknown[] = []): T[] {
  const stmt = raw.prepare(sqlText);
  stmt.bind(params as never);
  const out: T[] = [];
  while (stmt.step()) out.push(stmt.getAsObject() as T);
  stmt.free();
  return out;
}

const fakeDb = {
  async execAsync(sqlText: string) {
    raw.exec(sqlText);
  },
  async runAsync(sqlText: string, params: unknown[] = []) {
    raw.run(sqlText, params as never);
  },
  async getAllAsync<T>(sqlText: string, params: unknown[] = []) {
    return rows<T>(sqlText, params);
  },
  async getFirstAsync<T>(sqlText: string, params: unknown[] = []) {
    return rows<T>(sqlText, params)[0] ?? null;
  },
  async withTransactionAsync(fn: () => Promise<void>) {
    await fn();
  },
};

vi.mock('./client', () => ({ getDb: async () => fakeDb }));

const { getWorkoutSettings, restOf, saveWorkoutSettings } = await import('./workoutSettings');
const SQL = await initSqlJs();

beforeEach(async () => {
  raw = new SQL.Database();
  await runMigrations(fakeDb as never);
});

describe('workout settings', () => {
  it('starts from the defaults, saves, and fills in settings added later', async () => {
    expect(await getWorkoutSettings()).toEqual(DEFAULT_WORKOUT_SETTINGS);
    await saveWorkoutSettings({ ...DEFAULT_WORKOUT_SETTINGS, defaultRestSeconds: 90, repsLeft: false });
    expect(await getWorkoutSettings()).toMatchObject({ defaultRestSeconds: 90, repsLeft: false, prAlert: true });
    raw.run("UPDATE app_state SET value = '{\"keepAwake\":true}' WHERE key = 'workoutSettings'");
    expect(await getWorkoutSettings()).toEqual({ ...DEFAULT_WORKOUT_SETTINGS, keepAwake: true });
  });

  it("an exercise's own rest timer wins; 0 turns it off despite a default", () => {
    const settings = { ...DEFAULT_WORKOUT_SETTINGS, defaultRestSeconds: 120 };
    expect(restOf(null, settings)).toBe(120);
    expect(restOf(60, settings)).toBe(60);
    expect(restOf(0, settings)).toBe(0);
    expect(restOf(null, DEFAULT_WORKOUT_SETTINGS)).toBeNull();
  });
});
