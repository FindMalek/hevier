import type { ReactNode } from 'react';
// Workout Settings (Log Workout → Settings), saved as
// one JSON value in app_state (db/workoutSettings.ts).
export interface WorkoutSettings {
  defaultRestSeconds: number | null; // for exercises without their own rest timer; null = off
  keepAwake: boolean; // the screen stays on in Log Workout
  repsLeft: boolean; // the "Reps left?" row after the last set
  inlineTimer: boolean; // ▶ on timed sets
  prAlert: boolean; // the PR toast, chime and buzz when a set beats a record
}

// Workout Settings: a setting with its toggle and what it does.
export interface ToggleRowProps {
  title: string;
  description: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
}
