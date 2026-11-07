// SQL for the Profile tab.

// Every workout, oldest first, with its volume (Σ weight × reps) and reps.
export const SELECT_PROFILE_SESSIONS = `
  SELECT w.start_time, w.end_time,
         COALESCE(SUM(s.weight_kg * s.reps), 0) AS volume, COALESCE(SUM(s.reps), 0) AS reps
  FROM workouts w
  LEFT JOIN workout_exercises we ON we.workout_id = w.id
  LEFT JOIN sets s ON s.workout_exercise_id = we.id
  GROUP BY w.id
  ORDER BY w.start_time`;
