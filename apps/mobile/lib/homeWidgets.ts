import type { RecoveryStep, WidgetData } from '@/types/widgets';
import { DAYS_PER_WEEK, MS_PER_DAY, MS_PER_HOUR } from '@/constants/time';
import { RECENTLY_TRAINED_DAYS } from '@/constants/training';
import { dayKey, startOfWeek } from '@/lib/date';
import type { ProfileSession } from '@/types/profile';
import type { Cycle } from '@/types/routine';

// What the home-screen widgets show, from the sessions (db/profile/profile.ts) and the
// cycle (db/rotation/cycle.ts). Local days, weeks from Monday like the rest of the app.
export function widgetData(
  sessions: ProfileSession[],
  cycle: Cycle | null,
  recovery: RecoveryStep[],
  now = new Date()
): WidgetData {
  const monthFrom = dayKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
  const weekFrom = startOfWeek(now);
  weekFrom.setDate(weekFrom.getDate() - DAYS_PER_WEEK);
  const volumeFrom = dayKey(weekFrom);

  const days = new Set<string>();
  const volume: Record<string, number> = {};
  for (const s of sessions) {
    const day = dayKey(new Date(s.startTime));
    if (day >= monthFrom) days.add(day);
    if (day >= volumeFrom) volume[day] = (volume[day] ?? 0) + s.volumeKg;
  }
  return {
    days: [...days].sort(),
    volume,
    cycle: cycle && {
      name: cycle.routines[cycle.next].name,
      step: cycle.next + 1,
      total: cycle.routines.length,
      exercises: cycle.nextExercises,
    },
    recovery,
  };
}


// The Recovery body's colours over the next week, so the widget turns red →
// orange → green on time with the app closed: `colorsAt` checked now and on
// every hour after, keeping only the times something changes.
export function recoverySteps(colorsAt: (t: Date) => Record<string, string>, now = new Date()): RecoveryStep[] {
  const steps: RecoveryStep[] = [];
  let last = '';
  const firstHour = Math.floor(now.getTime() / MS_PER_HOUR) * MS_PER_HOUR + MS_PER_HOUR;
  const times = [now.getTime()];
  for (let t = firstHour; t <= now.getTime() + RECENTLY_TRAINED_DAYS * MS_PER_DAY; t += MS_PER_HOUR) times.push(t);
  for (const at of times) {
    const colors = colorsAt(new Date(at));
    const key = JSON.stringify(Object.entries(colors).sort());
    if (key === last) continue;
    last = key;
    steps.push({ at, colors });
  }
  return steps;
}
