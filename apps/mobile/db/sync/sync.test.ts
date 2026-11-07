import { describe, expect, it, vi } from 'vitest';
import initSqlJs, { type Database } from 'sql.js';
import { runMigrations } from '@/db/migrations';

// The device id and workout count sent with each copy to the PC.
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

let nextId = 0;
vi.mock('@/db/client', () => ({ getDb: async () => fakeDb }));
vi.mock('expo-crypto', () => ({ randomUUID: () => `id${++nextId}` }));
const { countWorkouts, getDeviceId } = await import('./sync');
const SQL = await initSqlJs();

describe('sync', () => {
  it('makes the device id once and keeps it in the database', async () => {
    raw = new SQL.Database();
    await runMigrations(fakeDb);
    const id = await getDeviceId();
    expect(id).toBe('id1');
    expect(await getDeviceId()).toBe('id1');
    expect(rows<{ value: string }>("SELECT value FROM app_state WHERE key = 'sync.deviceId'")[0].value).toBe('id1');
  });

  it('counts saved workouts', async () => {
    raw = new SQL.Database();
    await runMigrations(fakeDb);
    expect(await countWorkouts()).toBe(0);
    raw.exec(`INSERT INTO workouts (id, title, start_time) VALUES ('a', 'A', '2026-10-14T18:00:00Z'), ('b', 'B', '2026-10-15T18:00:00Z')`);
    expect(await countWorkouts()).toBe(2);
  });
});
