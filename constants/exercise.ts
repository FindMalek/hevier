// What an exercise logs: weight and reps, reps only, a time, or a distance and
// a time. The ExerciseType type (types/exercise.ts) is built from this list.
export const EXERCISE_TYPES = ['weight_reps', 'reps_only', 'duration', 'distance_duration'] as const;

// The units of the exercise page's chart and records (lib/stats/exerciseMetrics.ts).
// The Unit type (types/exercise.ts) is built from this list.
export const CHART_UNITS = ['kg', 'reps', 'seconds', 'km'] as const;

// The exercise page's tabs (app/exercises/[id].tsx), in order.
export const EXERCISE_PAGE_TABS = ['summary', 'history', 'howto'] as const;

// The two catalogue files an exercise can have on disk: a looping clip and a still.
export const CATALOGUE_MEDIA_KINDS = ['clip', 'still'] as const;

// The exercise picker's two filter sheets (app/add-exercise.tsx).
export const PICKER_FILTERS = ['equipment', 'muscles'] as const;
