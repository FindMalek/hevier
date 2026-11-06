import { SET_FIELD_LABELS } from '@/constants/labels';
import type { SetInputField } from '@/types/setFields';
import type { ExerciseType } from '@/types/exercise';

// The values a set can hold, in the order they are entered.
export const SET_FIELD_KEYS = ['weight', 'reps', 'km', 'time'] as const;

// The boxes a set row shows for each exercise type, left to right
// (Log Workout and the routine editor).
export const SET_FIELDS: Record<ExerciseType, SetInputField[]> = {
  weight_reps: [
    { label: SET_FIELD_LABELS.weight, field: 'weight' },
    { label: SET_FIELD_LABELS.reps, field: 'reps' },
  ],
  reps_only: [{ label: SET_FIELD_LABELS.reps, field: 'reps' }],
  duration: [{ label: SET_FIELD_LABELS.time, field: 'time' }],
  distance_duration: [
    { label: SET_FIELD_LABELS.km, field: 'km' },
    { label: SET_FIELD_LABELS.time, field: 'time' },
  ],
};
