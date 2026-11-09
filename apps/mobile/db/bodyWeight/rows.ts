// What the body weight queries return.

// SELECT_BODY_WEIGHTS
export interface BodyWeightRow {
  id: string;
  logged_at: string;
  weight_kg: number;
}

// SELECT_BODY_WEIGHT_EXERCISE_IDS
export interface ExerciseIdRow {
  id: string;
}
