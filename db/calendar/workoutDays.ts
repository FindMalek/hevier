import { getDb } from '@/db/client';
import { groupByDay } from '@/lib/calendar';
import type { WorkoutDays } from '@/types/calendar';
import { SELECT_WORKOUT_DAYS } from './queries';
import type { WorkoutDayRow } from './rows';

// Every workout, grouped by the local day it started on.
export async function getWorkoutDays(): Promise<WorkoutDays> {
  const db = await getDb();
  const rows = await db.getAllAsync<WorkoutDayRow>(SELECT_WORKOUT_DAYS);
  return groupByDay(rows.map((r) => ({ id: r.id, title: r.title, startTime: r.start_time })));
}
