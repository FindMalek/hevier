// What the session queries return.

// SELECT_SESSION_SETS, SELECT_SESSION_SETS_TITLED
export interface SessionSetRow {
  workout_id: string;
  start_time: string;
  end_time: string | null;
  weight_kg: number | null;
  reps: number | null;
  body_weight_kg: number | null; // what a body weight exercise's set counts (SET_BODY_WEIGHT)
}
