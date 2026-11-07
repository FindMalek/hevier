import { parseClock, parseNumber, perHandKg } from '@/lib/format/setFormat';
import type { ActiveExercise, ActiveSet, ActiveWorkout } from '@/types/workout';
import type { NotificationContent } from '@/types/notification';

// What the workout notification says. Between sets it shows the
// next set to do; while resting, the same set as "Next: ..." under a countdown.


// The set after the last ticked one, so a set skipped earlier doesn't take
// over; when nothing is left after it, the first set still open.
export function nextSet(workout: ActiveWorkout): { exercise: ActiveExercise; set: ActiveSet } | null {
  const all = workout.exercises.flatMap((exercise) => exercise.sets.map((set) => ({ exercise, set })));
  let lastDone = -1;
  all.forEach((s, i) => {
    if (s.set.done) lastDone = i;
  });
  return all.slice(lastDone + 1).find((s) => !s.set.done) ?? all.find((s) => !s.set.done) ?? null;
}

// "80 kg x 11 reps", "11 reps", "01:30", "2 km - 15:00"; '' when nothing is typed.
// Dumbbells per hand (db/perHand/perHand.ts): "15 kg each x 11 reps".
function setValues(exercise: ActiveExercise, set: ActiveSet, perHand = false): string {
  const weight = parseNumber(set.weight);
  const reps = parseNumber(set.reps);
  const km = parseNumber(set.km);
  const time = parseClock(set.time) === null ? '' : set.time.trim();
  const parts =
    exercise.type === 'weight_reps'
      ? [weight !== null && (perHand ? `${perHandKg(weight)} kg each` : `${weight} kg`), reps !== null && `${reps} reps`]
      : exercise.type === 'reps_only'
        ? [reps !== null && `${reps} reps`]
        : exercise.type === 'duration'
          ? [time]
          : [km !== null && `${km} km`, time];
  const shown = parts.filter((p): p is string => !!p);
  return shown.join(exercise.type === 'weight_reps' ? ' x ' : ' - ');
}

export function notificationContent(
  workout: ActiveWorkout,
  perHand: (exerciseId: string) => boolean = () => false
): NotificationContent {
  const next = nextSet(workout);
  const rest = { restEndsAt: workout.restEndsAt, restTotal: workout.restTotal };
  if (!next) {
    return { title: workout.title, setText: 'All sets done', restText: 'All sets done', ...rest, catalogueId: null, next: null };
  }
  const { exercise, set } = next;
  const number = exercise.sets.indexOf(set) + 1;
  const count = exercise.sets.length;
  const values = setValues(exercise, set, perHand(exercise.exerciseId));
  return {
    title: exercise.name,
    setText: `Set ${number}/${count}` + (values ? ` - ${values}` : ''),
    restText: `Next: Set ${number} of ${count}` + (values ? ` (${values})` : ''),
    ...rest,
    catalogueId: exercise.catalogueId,
    next: { exerciseKey: exercise.key, setKey: set.key },
  };
}

// Whether two contents show the same thing, so a change elsewhere in the
// workout (typing in a later set) doesn't redraw the notification.
export function sameNotification(a: NotificationContent | null, b: NotificationContent | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.title === b.title &&
    a.setText === b.setText &&
    a.restText === b.restText &&
    a.restEndsAt === b.restEndsAt &&
    a.restTotal === b.restTotal &&
    a.catalogueId === b.catalogueId &&
    a.next?.exerciseKey === b.next?.exerciseKey &&
    a.next?.setKey === b.next?.setKey
  );
}
