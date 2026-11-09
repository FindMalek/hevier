import { describe, expect, it, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { runMigrations } from '@/db/migrations';

// The workout count and last workout sent with each copy to the PC.
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

vi.mock('@/db/client', () => ({ getDb: async () => fakeDb }));
const { countWorkouts, lastWorkoutStart } = await import('./sync');
const SQL = await initSqlJs();

describe('sync', () => {
  it('finds when the newest workout started', async () => {
    raw = new SQL.Database();
    await runMigrations(fakeDb);
    expect(await lastWorkoutStart()).toBeNull();
    raw.exec(`INSERT INTO workouts (id, title, start_time) VALUES ('a', 'A', '2026-11-06T15:31:57.722Z'), ('b', 'B', '2026-10-15T18:00:00Z')`);
    expect(await lastWorkoutStart()).toBe('2026-11-06T15:31:57.722Z');
  });

  it('counts saved workouts', async () => {
    raw = new SQL.Database();
    await runMigrations(fakeDb);
    expect(await countWorkouts()).toBe(0);
    raw.exec(`INSERT INTO workouts (id, title, start_time) VALUES ('a', 'A', '2026-10-14T18:00:00Z'), ('b', 'B', '2026-10-15T18:00:00Z')`);
    expect(await countWorkouts()).toBe(2);
  });
});
