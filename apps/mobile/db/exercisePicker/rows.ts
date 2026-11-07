import type { ExerciseType } from '@/types/exercise';

// What the picker's queries return.

// SELECT_PICKER_EXERCISES
export interface PickerExerciseRow {
  id: string;
  name: string;
  type: ExerciseType;
  catalogue_id: string | null;
  target_muscle: string | null;
  body_part: string | null;
  equipment: string | null;
  times_done: number;
  last_done: string | null;
}
