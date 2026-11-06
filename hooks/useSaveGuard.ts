import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';

import { discardActiveWorkout, endActiveWorkout, updateActiveWorkout } from '@/stores/activeWorkoutStore';
import type { RoutineUpdate } from '@/components/save-workout/types';
import { getRoutineForEdit } from '@/db/routines/editor';
import { saveRoutine } from '@/db/routines/write';
import { finishWorkout } from '@/db/workouts/write';
import { pauseTimer, resumeTimer } from '@/lib/workout/activeWorkout';
import { changesMessage, routineChanges, routineFromWorkout } from '@/lib/workout/routineUpdate';
import type { EditorRoutine } from '@/types/routine';
import type { ActiveWorkout } from '@/types/workout';

// Save Workout's save, update-routine and discard, kept together because they
// share two refs:
// - pausedHere: the clock was paused on arrival, so leaving back to Log Workout
//   runs it on again (after Save or Discard there is no workout left to resume);
// - saving: Save is running; a second tap (or Update Routine / Keep Original
//   during it) would save twice, and a Discard would delete the photos being saved.
export function useSaveGuard(workout: ActiveWorkout | null) {
  const router = useRouter();
  // Done differently from its routine: the "Update routine" sheet first.
  const [update, setUpdate] = useState<RoutineUpdate | null>(null);
  const pausedHere = useRef(false);
  const saving = useRef(false);

  // The clock stands still while here, and runs on again on the way back.
  useEffect(() => {
    updateActiveWorkout((w) => {
      if (w.pausedAt || w.backdated) return w;
      pausedHere.current = true;
      return pauseTimer(w, Date.now());
    });
    return () => {
      if (pausedHere.current) updateActiveWorkout((w) => resumeTimer(w, Date.now()));
    };
  }, []);

  // A failed save keeps the draft, and the user stays here to try again.
  async function guarded(run: () => Promise<void>) {
    if (saving.current) return;
    saving.current = true;
    try {
      await run();
    } catch (e) {
      console.warn('[save] failed', e);
    } finally {
      saving.current = false;
    }
  }

  async function finishNow(updateRoutine?: EditorRoutine) {
    if (!workout) return;
    setUpdate(null);
    if (updateRoutine) await saveRoutine(routineFromWorkout(updateRoutine, workout));
    const id = await finishWorkout(workout);
    pausedHere.current = false;
    endActiveWorkout();
    // Back to the tabs, then the "Nice work!" cards (app/nice-work.tsx).
    router.dismissAll();
    router.push({ pathname: '/nice-work', params: { id } });
  }

  // Save: asks about the routine first when the workout strayed from it.
  function save() {
    return guarded(async () => {
      if (!workout) return;
      const routine = workout.routineId ? await getRoutineForEdit(workout.routineId) : null;
      const message = routine && changesMessage(routineChanges(routine, workout));
      if (routine && message) {
        setUpdate({ routine, message });
        return;
      }
      await finishNow();
    });
  }

  // From the sheet: Update Routine passes the routine to make what was done.
  function finish(updateRoutine?: EditorRoutine) {
    return guarded(() => finishNow(updateRoutine));
  }

  function discard() {
    // Too late once Save is running: it would delete the photos being saved.
    if (saving.current) return;
    pausedHere.current = false;
    discardActiveWorkout();
    router.dismissAll();
  }

  return { update, closeUpdate: () => setUpdate(null), save, finish, discard };
}
