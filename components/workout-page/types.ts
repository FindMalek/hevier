import type { CardExercise } from '@/types/feed';
import type { SplitPart } from '@/types/stats';

// Props of the workout page pieces (components/workout-page/).

export interface MuscleSplitProps {
  split: SplitPart[]; // biggest first
}

export interface WorkoutExerciseBlockProps {
  exercise: CardExercise;
  onOpen: (exerciseId: string) => void;
}
