// What the sync queries return.

// COUNT_WORKOUTS
export interface WorkoutCountRow {
  n: number;
}

// SELECT_LAST_WORKOUT_START
export interface LastWorkoutRow {
  start_time: string | null;
}
