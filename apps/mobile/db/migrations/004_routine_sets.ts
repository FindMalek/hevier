// A routine's planned sets (what the routine page lists under each exercise)
// and each exercise's rest timer (NULL = off). Hevy's export has no routines,
// so existing routines get the sets of the latest workout with the same title:
// the same numbers Hevy showed on its routine page.
export const sql = `
ALTER TABLE routine_exercises ADD COLUMN rest_seconds INTEGER;
CREATE TABLE routine_sets (
  id                   TEXT PRIMARY KEY,
  routine_exercise_id  TEXT NOT NULL REFERENCES routine_exercises(id),
  set_index            INTEGER NOT NULL,
  set_type             TEXT NOT NULL DEFAULT 'normal' CHECK (set_type IN ('normal', 'failure')),
  weight_kg            REAL,
  reps                 INTEGER,
  distance_km          REAL,
  duration_seconds     INTEGER
);
CREATE INDEX idx_routine_sets_routine_exercise ON routine_sets(routine_exercise_id);
INSERT INTO routine_sets (id, routine_exercise_id, set_index, set_type, weight_kg, reps, distance_km, duration_seconds)
SELECT lower(hex(randomblob(16))), re.id, s.set_index, s.set_type, s.weight_kg, s.reps, s.distance_km, s.duration_seconds
FROM routine_exercises re
JOIN routines r ON r.id = re.routine_id
JOIN workout_exercises we ON we.exercise_id = re.exercise_id AND we.order_index = re.order_index
  AND we.workout_id = (SELECT w.id FROM workouts w WHERE w.title = r.name ORDER BY w.start_time DESC LIMIT 1)
JOIN sets s ON s.workout_exercise_id = we.id;
`;
