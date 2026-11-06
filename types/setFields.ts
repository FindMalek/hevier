import type { SET_FIELD_KEYS } from '@/constants/setFields';

// One of the values a set can hold: weight, reps, km or time.
export type SetFieldKey = (typeof SET_FIELD_KEYS)[number];

// One input box in a set row: its column header and the value it edits.
export interface SetInputField {
  label: string;
  field: SetFieldKey;
}
