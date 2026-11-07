export const sql = `
CREATE TABLE exercises (
  id    TEXT PRIMARY KEY,
  name  TEXT UNIQUE NOT NULL,
  type  TEXT NOT NULL CHECK (type IN ('weight_reps', 'reps_only', 'duration', 'distance_duration'))
);

CREATE TABLE workouts (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  start_time  TEXT NOT NULL,
  end_time    TEXT,
  description TEXT
);

CREATE TABLE workout_exercises (
  id           TEXT PRIMARY KEY,
  workout_id   TEXT NOT NULL REFERENCES workouts(id),
  exercise_id  TEXT NOT NULL REFERENCES exercises(id),
  order_index  INTEGER NOT NULL,
  notes        TEXT
);

CREATE TABLE sets (
  id                   TEXT PRIMARY KEY,
  workout_exercise_id  TEXT NOT NULL REFERENCES workout_exercises(id),
  set_index            INTEGER NOT NULL,
  set_type              TEXT NOT NULL CHECK (set_type IN ('normal', 'failure')),
  weight_kg             REAL,
  reps                  INTEGER,
  distance_km           REAL,
  duration_seconds      INTEGER,
  rpe                   REAL
);

CREATE TABLE routines (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL
);

CREATE TABLE routine_exercises (
  id           TEXT PRIMARY KEY,
  routine_id   TEXT NOT NULL REFERENCES routines(id),
  exercise_id  TEXT NOT NULL REFERENCES exercises(id),
  order_index  INTEGER NOT NULL
);

CREATE INDEX idx_workout_exercises_workout ON workout_exercises(workout_id);
CREATE INDEX idx_sets_workout_exercise ON sets(workout_exercise_id);
CREATE INDEX idx_routine_exercises_routine ON routine_exercises(routine_id);
`;
