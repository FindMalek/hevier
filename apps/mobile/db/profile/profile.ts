import { cached } from '@/db/historyCache';
import { getWorkoutSessions } from '@/db/sessions/sessions';
import type { Profile } from '@/types/profile';
import { getProfileNames } from './names';

// The Profile tab:
// name and every past workout, for Workouts / Streak / Hours and the bar chart
// (lib/stats/profileCharts.ts).

// Shared by every screen until the history or the names change
// (db/historyCache.ts): don't change it.
export function getProfile(): Promise<Profile> {
  return cached('profile', loadProfile);
}

async function loadProfile(): Promise<Profile> {
  const [names, sessions] = await Promise.all([getProfileNames(), getWorkoutSessions()]);
  return { ...names, sessions };
}
