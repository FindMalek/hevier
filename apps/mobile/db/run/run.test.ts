import { beforeEach, describe, expect, it, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { runMigrations } from '@/db/migrations';

// getCheckIn, saveCheckIn and saveRunFeedback on an in-memory sql.js database, as in appState.test.ts.
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
};

vi.mock('@/db/client', () => ({ getDb: async () => fakeDb }));

const { getCheckIn, saveCheckIn } = await import('./checkIns');
const { saveRunFeedback } = await import('./feedback');

beforeEach(async () => {
  const SQL = await initSqlJs();
  raw = new SQL.Database();
  await runMigrations(fakeDb as never);
});

describe('check-ins', () => {
  it('reads null when there is none', async () => {
    expect(await getCheckIn('2026-11-10')).toBeNull();
  });

  it('keeps one per day: saving again replaces it', async () => {
    const first = { date: '2026-11-10', feel: 'fresh', sleepHours: 7.5, legsSore: false, pain: false, sick: false } as const;
    await saveCheckIn(first, new Date(2026, 10, 10, 6, 20));
    expect(await getCheckIn('2026-11-10')).toEqual(first);
    await saveCheckIn({ ...first, feel: 'drained', sleepHours: null, legsSore: true }, new Date(2026, 10, 10, 6, 25));
    expect(await getCheckIn('2026-11-10')).toEqual({ ...first, feel: 'drained', sleepHours: null, legsSore: true });
    expect(rows('SELECT date FROM run_checkins')).toHaveLength(1);
    expect(await getCheckIn('2026-11-11')).toBeNull();
  });
});

describe('run feedback', () => {
  it('keeps the verdict shown and how the legs felt, one row per run', async () => {
    raw.exec("INSERT INTO workouts (id, title, start_time) VALUES ('w', 'Run', '2026-11-10T06:30:00Z')");
    await saveRunFeedback('w', 'easy', null);
    await saveRunFeedback('w', 'easy', 'heavy');
    expect(rows('SELECT workout_id, verdict_shown, legs_felt FROM run_feedback')).toEqual([
      { workout_id: 'w', verdict_shown: 'easy', legs_felt: 'heavy' },
    ]);
  });
});
