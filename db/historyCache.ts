// The history (workout cards, profile sessions, statistics sets) is loaded once
// and shared by every screen until something changes it: Home, Profile and the
// statistics screens reload on every focus, and each load reads every set.
// Only raw data is kept here, nothing that depends on the time of day.
// Callers must not change what they get (it is the same object for everyone).

const entries = new Map<string, Promise<unknown>>();

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  let entry = entries.get(key) as Promise<T> | undefined;
  if (!entry) {
    const loading = load();
    entry = loading;
    entries.set(key, loading);
    // A failed load isn't kept: the next call tries again.
    loading.catch(() => {
      if (entries.get(key) === loading) entries.delete(key);
    });
  }
  return entry;
}

// After every write to workouts, sets, exercises or the profile, and when the
// database is closed (restore from backup). A load still under way is dropped
// too: whoever asks next gets a fresh one.
export function invalidateHistory(): void {
  entries.clear();
}
