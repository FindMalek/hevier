import { DEFAULT_WORKOUT_SETTINGS } from '@/constants/defaults';
import type { WorkoutSettings } from '@/types/workoutSettings';
import { STORAGE_KEYS } from '@/constants/storage';
import { getJson, setJson } from '@/db/appState/appState';

// Workout Settings (Log Workout → Settings), saved as
// one JSON value in app_state. The type is in types/workoutSettings.ts, the
// defaults in constants/defaults.ts.


export async function getWorkoutSettings(): Promise<WorkoutSettings> {
  const saved = await getJson<Partial<WorkoutSettings>>(STORAGE_KEYS.workoutSettings);
  // Settings added later fall back to their defaults.
  return { ...DEFAULT_WORKOUT_SETTINGS, ...(saved ?? {}) };
}

export async function saveWorkoutSettings(settings: WorkoutSettings): Promise<void> {
  await setJson(STORAGE_KEYS.workoutSettings, settings);
}

// An exercise's rest timer: its own, else the default. 0 = turned off for
// that exercise even when there is a default.
export function restOf(restSeconds: number | null, settings: WorkoutSettings): number | null {
  return restSeconds ?? settings.defaultRestSeconds;
}
