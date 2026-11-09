// What the training cycle's queries return.

// selectRoutinesIn
export interface CycleRoutineRow {
  id: string;
  name: string;
}

// selectLastCycleWorkout
export interface LastCycleWorkoutRow {
  title: string;
  start_time: string;
}

// SELECT_ROUTINE_EXERCISE_NAMES
export interface ExerciseNameRow {
  name: string;
}
