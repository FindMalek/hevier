import { marks } from '@/db/placeholders';

// SQL for the training cycle (the routines' order itself is saved in app_state).

// The cycle's routines that still exist, by id: one ? per id.
export function selectRoutinesIn(count: number): string {
  return `SELECT id, name FROM routines WHERE id IN (${marks(count)})`;
}

// The newest workout titled like one of the cycle's routines: one ? per name (index on workouts.start_time).
export function selectLastCycleWorkout(count: number): string {
  return `SELECT title, start_time FROM workouts WHERE title IN (${marks(count)}) ORDER BY start_time DESC LIMIT 1`;
}

// One routine's exercise names, in order (the next routine's list on Home).
export const SELECT_ROUTINE_EXERCISE_NAMES = `
  SELECT e.name
  FROM routine_exercises re
  JOIN exercises e ON e.id = re.exercise_id
  WHERE re.routine_id = ?
  ORDER BY re.order_index`;
