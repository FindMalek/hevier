// Warm-up sets ("W"), in workouts and routines. SQLite can't change a
// CHECK, so both tables are rebuilt with the same columns; nothing else
// references them.
export const sql = `
CREATE TABLE sets_new (
  id                   TEXT PRIMARY KEY,
  workout_exercise_id  TEXT NOT NULL REFERENCES workout_exercises(id),
  set_index            INTEGER NOT NULL,
  set_type             TEXT NOT NULL CHECK (set_type IN ('normal', 'failure', 'warmup')),
  weight_kg            REAL,
  reps                 INTEGER,
  distance_km          REAL,
  duration_seconds     INTEGER,
  rpe                  REAL
);
INSERT INTO sets_new SELECT id, workout_exercise_id, set_index, set_type, weight_kg, reps, distance_km, duration_seconds, rpe FROM sets;
DROP TABLE sets;
ALTER TABLE sets_new RENAME TO sets;
CREATE INDEX idx_sets_workout_exercise ON sets(workout_exercise_id);

CREATE TABLE routine_sets_new (
  id                   TEXT PRIMARY KEY,
  routine_exercise_id  TEXT NOT NULL REFERENCES routine_exercises(id),
  set_index            INTEGER NOT NULL,
  set_type             TEXT NOT NULL DEFAULT 'normal' CHECK (set_type IN ('normal', 'failure', 'warmup')),
  weight_kg            REAL,
  reps                 INTEGER,
  distance_km          REAL,
  duration_seconds     INTEGER
);
INSERT INTO routine_sets_new SELECT id, routine_exercise_id, set_index, set_type, weight_kg, reps, distance_km, duration_seconds FROM routine_sets;
DROP TABLE routine_sets;
ALTER TABLE routine_sets_new RENAME TO routine_sets;
CREATE INDEX idx_routine_sets_routine_exercise ON routine_sets(routine_exercise_id);
`;
