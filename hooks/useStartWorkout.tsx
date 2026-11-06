import { useCallback, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { beginWorkout, getActiveWorkout } from '@/stores/activeWorkoutStore';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { WorkoutSource } from '@/types/workout';

// "Start Routine" / "Start Empty Workout" / Copy Workout, and logging a past
// day from the calendar (`day`). A workout already in progress is never
// replaced silently: the user chooses to resume it or discard it.
export function useStartWorkout() {
  const router = useRouter();
  const [pending, setPending] = useState<{ source: WorkoutSource; day?: Date } | null>(null);
  // A second tap while the first is still starting would start it twice and
  // open Log Workout twice.
  const busy = useRef(false);

  const once = useCallback(async (run: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await run();
    } catch (e) {
      console.warn('[workout] start failed', e);
    } finally {
      busy.current = false;
    }
  }, []);

  // The same function on every render.
  const start = useCallback(
    (source: WorkoutSource, day?: Date) =>
      once(async () => {
        if (await getActiveWorkout()) {
          setPending({ source, day });
          return;
        }
        await beginWorkout(source, day);
        router.push('/log-workout');
      }),
    [once, router]
  );

  const dialog = (
    <ConfirmDialog
      visible={pending !== null}
      message="You have a workout in progress. Discard it and start a new one?"
      confirmLabel="Discard and Start New"
      cancelLabel="Resume Workout"
      onConfirm={() =>
        once(async () => {
          const source = pending?.source ?? null;
          const day = pending?.day;
          setPending(null);
          await beginWorkout(source, day);
          router.push('/log-workout');
        })
      }
      onCancel={() => {
        setPending(null);
        router.push('/log-workout');
      }}
    />
  );

  return { start, dialog };
}
