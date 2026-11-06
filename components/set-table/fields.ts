import type { SetInputField } from '@/types/setFields';

// The two value columns of a set row. An exercise with one value (reps, time)
// shows it in the second column, so it lines up under the others.
export function slotsOf(fields: SetInputField[]): (SetInputField | null)[] {
  return fields.length === 1 ? [null, fields[0]] : fields;
}
