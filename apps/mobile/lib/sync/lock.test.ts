import { describe, expect, it } from 'vitest';

import { isSyncBusy, withSyncLock } from './lock';

describe('withSyncLock', () => {
  it('runs the task holding the lock, and frees it after', async () => {
    expect(await withSyncLock(async () => (isSyncBusy() ? 'held' : 'free'))).toBe('held');
    expect(isSyncBusy()).toBe(false);
  });

  it('answers busy without running a second task', async () => {
    let ran = false;
    let release = () => {};
    const first = withSyncLock(() => new Promise<void>((r) => (release = r)));
    expect(await withSyncLock(async () => (ran = true))).toEqual({ ok: false, reason: 'busy' });
    expect(ran).toBe(false);
    release();
    await first;
  });

  it('frees the lock when the task throws', async () => {
    await expect(withSyncLock(async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    expect(isSyncBusy()).toBe(false);
  });
});
