import { describe, expect, it, vi } from 'vitest';

const stored = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => stored.get(k) ?? null,
    setItem: async (k: string, v: string) => void stored.set(k, v),
    removeItem: async (k: string) => void stored.delete(k),
  },
}));
const { noteUnfinishedRestore, takeUnfinishedRestoreNotice } = await import('./restoreNotice');

describe('the unfinished restore note', () => {
  it('is there once after it was noted, and nothing before', async () => {
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
    await noteUnfinishedRestore();
    expect(await takeUnfinishedRestoreNotice()).toBe(true);
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
  });
});
