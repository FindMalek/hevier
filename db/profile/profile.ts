import { getDb } from '@/db/client';
import { cached } from '@/db/historyCache';
import { durationSecondsOf } from '@/lib/workout/duration';
import type { Profile } from '@/types/profile';
import { getProfileNames } from './names';
import { SELECT_PROFILE_SESSIONS } from './queries';
import type { ProfileSessionRow } from './rows';

// The Profile tab:
// name and every past workout, for Workouts / Streak / Hours and the bar chart
// (lib/stats/profileCharts.ts).

// Shared by every screen until the history or the names change
// (db/historyCache.ts): don't change it.
export function getProfile(): Promise<Profile> {
  return cached('profile', loadProfile);
}

async function loadProfile(): Promise<Profile> {
  const names = await getProfileNames();
  const db = await getDb();
  const rows = await db.getAllAsync<ProfileSessionRow>(SELECT_PROFILE_SESSIONS);
  return {
    ...names,
    sessions: rows.map((r) => ({
      startTime: r.start_time,
      durationSeconds: durationSecondsOf(r.start_time, r.end_time),
      volumeKg: r.volume,
      reps: r.reps,
    })),
  };
}
