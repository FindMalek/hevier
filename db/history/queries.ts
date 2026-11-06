import { marks } from '@/db/placeholders';

// SQL for past workouts' sets (the PREVIOUS column).

// Each exercise's sets from the latest workout with it (by start time, then the
// later entry in the same workout). One `?` per exercise id.
export function selectPreviousSetsFor(idCount: number): string {
  return `
  WITH latest AS (
    SELECT we.id, we.exercise_id,
           ROW_NUMBER() OVER (PARTITION BY we.exercise_id ORDER BY w.start_time DESC, we.order_index DESC) AS n
    FROM workout_exercises we JOIN workouts w ON w.id = we.workout_id
    WHERE we.exercise_id IN (${marks(idCount)}))
  SELECT l.exercise_id, s.set_type, s.weight_kg, s.reps, s.distance_km, s.duration_seconds
  FROM latest l JOIN sets s ON s.workout_exercise_id = l.id
  WHERE l.n = 1
  ORDER BY l.exercise_id, s.set_index`;
}
