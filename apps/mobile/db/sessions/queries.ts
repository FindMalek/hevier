import { SET_BODY_WEIGHT } from '@/db/bodyWeight/queries';

// SQL for the workouts with their totals (Profile tab, routine page).

// Every set of every workout, oldest workout first (a workout without sets
// comes once, set columns null), with the body weight its set counts. The
// totals are added up in db/sessions/sessions.ts with lib/volume.ts.
const SESSION_SETS = `
  SELECT w.id AS workout_id, w.start_time, w.end_time, s.weight_kg, s.reps,
         ${SET_BODY_WEIGHT} AS body_weight_kg
  FROM workouts w
  LEFT JOIN workout_exercises we ON we.workout_id = w.id
  LEFT JOIN exercises e ON e.id = we.exercise_id
  LEFT JOIN sets s ON s.workout_exercise_id = we.id`;

export const SELECT_SESSION_SETS = `${SESSION_SETS}
  ORDER BY w.start_time, w.id`;

// Only the workouts with this title (a routine's).
export const SELECT_SESSION_SETS_TITLED = `${SESSION_SETS}
  WHERE w.title = ?
  ORDER BY w.start_time, w.id`;
