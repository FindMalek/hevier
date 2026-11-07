import { getDb } from '@/db/client';
import { durationSecondsOf } from '@/lib/workout/duration';
import { setVolumeKg } from '@/lib/volume';
import type { WorkoutSession } from '@/types/workout';
import { SELECT_SESSION_SETS, SELECT_SESSION_SETS_TITLED } from './queries';
import type { SessionSetRow } from './rows';

// Every workout, oldest first, with its duration, volume (lib/volume.ts) and
// reps: all of them for the Profile tab, a routine's (by title) for its page.
export async function getWorkoutSessions(title?: string): Promise<WorkoutSession[]> {
  const db = await getDb();
  const rows =
    title === undefined
      ? await db.getAllAsync<SessionSetRow>(SELECT_SESSION_SETS)
      : await db.getAllAsync<SessionSetRow>(SELECT_SESSION_SETS_TITLED, [title]);
  return sessionsOf(rows);
}

// One session per workout, in the rows' order.
export function sessionsOf(rows: SessionSetRow[]): WorkoutSession[] {
  const sessions: WorkoutSession[] = [];
  let lastId: string | null = null;
  for (const r of rows) {
    if (r.workout_id !== lastId) {
      sessions.push({ startTime: r.start_time, durationSeconds: durationSecondsOf(r.start_time, r.end_time), volumeKg: 0, reps: 0 });
      lastId = r.workout_id;
    }
    const session = sessions[sessions.length - 1];
    session.volumeKg += setVolumeKg(r.weight_kg, r.reps, r.body_weight_kg);
    session.reps += r.reps ?? 0;
  }
  return sessions;
}
