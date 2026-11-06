// Indexes for the lookups the screens make: an exercise's history and its
// previous sets (by exercise), the history in date order, and a routine's past
// sessions (workouts with its title).
export const sql = `
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_exercise ON routine_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workouts_start_time ON workouts(start_time);
CREATE INDEX IF NOT EXISTS idx_workouts_title ON workouts(title);
`;
