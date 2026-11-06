// What a row of the Workout tab's routine list is, for the routine drag
// (lib/routineDrop.ts). The DragItemKind type (types/routine.ts) is built from this list.
export const DRAG_ITEM_KINDS = ['header', 'card', 'box'] as const;

// What the routine page's chart shows, in pill order. The RoutineMetric type
// (types/routine.ts) is built from this list.
export const ROUTINE_METRICS = ['volume', 'reps', 'duration'] as const;
