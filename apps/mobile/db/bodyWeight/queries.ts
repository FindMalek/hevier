import { BODY_WEIGHT_EQUIPMENT } from '@/constants/weight';

// SQL for the body weights (Profile → Body weight) and the weight a body
// weight exercise's set counts (volume: lib/volume.ts).

// Every logged body weight, newest first.
export const SELECT_BODY_WEIGHTS = `
  SELECT id, logged_at, weight_kg
  FROM body_weights
  ORDER BY logged_at DESC`;

export const INSERT_BODY_WEIGHT = 'INSERT INTO body_weights (id, logged_at, weight_kg) VALUES (?, ?, ?)';

export const DELETE_BODY_WEIGHT = 'DELETE FROM body_weights WHERE id = ?';

// The ids of the exercises that count the body weight.
export const SELECT_BODY_WEIGHT_EXERCISE_IDS = `
  SELECT id
  FROM exercises
  WHERE type = 'reps_only' AND equipment = '${BODY_WEIGHT_EQUIPMENT}'`;

// For a query with an exercise `e` and a workout `w`: the body weight a set of
// `e` counts in `w`, else NULL. The last weight logged before the workout
// started; a workout older than every logged weight takes the first one (so the
// history counts as soon as one weight is logged). NULL for other exercises.
export const SET_BODY_WEIGHT = `
  CASE WHEN e.type = 'reps_only' AND e.equipment = '${BODY_WEIGHT_EQUIPMENT}' THEN COALESCE(
    (SELECT bw.weight_kg FROM body_weights bw WHERE bw.logged_at <= w.start_time ORDER BY bw.logged_at DESC LIMIT 1),
    (SELECT bw.weight_kg FROM body_weights bw ORDER BY bw.logged_at LIMIT 1)
  ) END`;
