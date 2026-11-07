import { describe, expect, it, vi } from 'vitest';

// Two screens asking for the database at the same moment (app start) must
// share one connection: a second, discarded connection to the same file got
// cleaned up by Android and broke the one in use (NullPointerException in
// prepareAsync), losing the ✓ on completed sets.
const opened: object[] = [];
vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => {
    const db = { execAsync: async () => {}, getFirstAsync: async () => ({ user_version: 99 }) };
    opened.push(db);
    return db;
  }),
}));

const { getDb } = await import('./client');

describe('getDb', () => {
  it('opens one connection even when called several times at once', async () => {
    const [a, b, c] = await Promise.all([getDb(), getDb(), getDb()]);
    expect(opened).toHaveLength(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});
