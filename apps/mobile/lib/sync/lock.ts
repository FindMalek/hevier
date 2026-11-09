// One sync or restore at a time: both use the same cache folders, and a sync
// finishing must not clear a restore's downloads (or the other way round).
let held = false;

// Returns the function that frees the lock, or null while another one runs.
export function acquireSyncLock(): (() => void) | null {
  if (held) return null;
  held = true;
  return () => {
    held = false;
  };
}

// Runs `run` while holding the lock; answers busy without running it when
// something else holds it. The lock is freed however `run` ends.
export async function withSyncLock<T>(run: () => Promise<T>): Promise<T | { ok: false; reason: 'busy' }> {
  const release = acquireSyncLock();
  if (!release) return { ok: false, reason: 'busy' };
  try {
    return await run();
  } finally {
    release();
  }
}

// For a screen to say so before it asks the user anything.
export function isSyncBusy(): boolean {
  return held;
}
