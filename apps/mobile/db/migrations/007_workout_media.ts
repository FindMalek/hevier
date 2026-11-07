// Photos and videos added on the Save Workout page. The files live in the
// app's documents under media/; `file` is the name there.
export const sql = `
CREATE TABLE workout_media (
  id          TEXT PRIMARY KEY,
  workout_id  TEXT NOT NULL REFERENCES workouts(id),
  file        TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('photo', 'video')),
  position    INTEGER NOT NULL
);
CREATE INDEX idx_workout_media_workout ON workout_media(workout_id);
`;
