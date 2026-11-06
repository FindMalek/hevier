import type { EditorRoutine } from '@/types/routine';

// Props and local types of the Save Workout pieces (components/save-workout/).

// Done differently from its routine: what the "Update routine" sheet asks about.
export interface RoutineUpdate {
  routine: EditorRoutine;
  message: string; // "You added 2 sets…"
}

export interface UpdateRoutineSheetProps {
  update: RoutineUpdate | null;
  onUpdate: (routine: EditorRoutine) => void;
  onKeep: () => void;
  onDismiss: () => void;
}
