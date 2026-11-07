// What the Statistics queries return.

// SELECT_STAT_SETS
export interface StatSetRow {
  workout_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  exercise_id: string;
  name: string;
  catalogue_id: string | null;
  target_muscle: string | null;
  body_part: string | null;
  secondary_muscles: string | null;
  weight_kg: number | null;
  reps: number | null;
  duration_seconds: number | null;
  set_type: string;
  rpe: number | null;
}
