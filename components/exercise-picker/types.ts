import type { PICKER_FILTERS } from '@/constants/exercise';
import type { PickerExercise } from '@/types/exercise';

// Props and local types of the exercise picker pieces (components/exercise-picker/).

// Which filter sheet is open.
export type PickerFilter = (typeof PICKER_FILTERS)[number];

// The exercise being replaced, and how many sets the new one starts with.
export interface Replacing {
  id: string;
  sets: number;
}

export interface PickerRowProps {
  exercise: PickerExercise;
  selected: boolean;
  onPress: (exercise: PickerExercise) => void;
  onInfo?: (exercise: PickerExercise) => void; // none: a › (Profile's Exercises list)
}

export interface FilterButtonProps {
  label: string;
  picks: string[];
  onPress: () => void;
  onClear: () => void;
}
