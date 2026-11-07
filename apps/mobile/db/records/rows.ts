// What the records queries return.

// selectSetsOfExercises
export interface ExerciseSetRow {
  exercise_id: string;
  weight_kg: number | null;
  reps: number | null;
  distance_km: number | null;
  duration_seconds: number | null;
}
