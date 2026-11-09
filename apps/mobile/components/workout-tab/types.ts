import type { RoutineFolder } from '@/types/routine';

// Props of the Workout tab pieces (components/workout-tab/).

export interface FolderMenuSheetProps {
  folder: RoutineFolder | null; // the folder whose ⋯ was tapped
  onDismiss: () => void;
  onClosed: () => void; // the sheet has slid away (useAfterSheetClose)
  onReorder: () => void;
  onRename: (folder: RoutineFolder) => void;
  onAddRoutine: (folder: RoutineFolder) => void;
  onDelete: (folder: RoutineFolder) => void;
}
