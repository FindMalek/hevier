// Running in the app. A run is logged like any other exercise: one set with a
// distance, a time and how hard it felt (session RPE out of 10, saved in
// sets.rpe). Recovery and Conditioning treat it on its own, as with Football.

// The exercise name that marks a run (the built-in exercise of migration 015).
export const RUN = 'Run';

// Names a Hevy export may use for the same thing: the import files these under
// Run. The openGym catalogue's own "run" entry is left out of the library,
// since Run is built in.
export const RUN_IMPORT_NAMES = ['Run', 'Running', 'Running (Outdoor)', 'Running (Treadmill)'] as const;
export const RUN_CATALOGUE_ID = '0685';

// Session RPE (1–10): up to the first is easy, from the second hard, between is moderate.
export const RUN_EASY_MAX_RPE = 4;
export const RUN_HARD_MIN_RPE = 7;
// A run saved without RPE (imported, or skipped) counts as this.
export const RUN_DEFAULT_RPE = 4;

// The effort chips in Log Workout, easy to hard.
export const RUN_EFFORT_CHOICES = [2, 3, 4, 6, 8] as const;
