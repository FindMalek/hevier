import { marks } from '@/db/placeholders';

// SQL for personal records.

// Every set of some exercises, with what records are measured on; one ? per id.
export function selectSetsOfExercises(idCount: number): string {
  return `
  SELECT we.exercise_id, s.set_type, s.weight_kg, s.reps, s.distance_km, s.duration_seconds
  FROM sets s JOIN workout_exercises we ON we.id = s.workout_exercise_id
  WHERE we.exercise_id IN (${marks(idCount)})`;
}
