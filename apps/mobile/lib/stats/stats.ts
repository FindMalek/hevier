import { DAYS_PER_WEEK, MS_PER_DAY } from '@/constants/time';
import { SPLIT_OTHER_PART_SHARE, WARM_UP_EXERCISE } from '@/constants/training';
import { BODY_PARTS, BODY_PART_OF } from '@/constants/muscles';
import { startMsOf } from '@/lib/training/effort';
import { startOfDay } from '@/lib/date';
import { setVolumeKg } from '@/lib/volume';
import type { BodyPart, MuscleGroup } from '@/types/muscles';
import type { MainExercise, MonthReport, MuscleCount, SplitPart, StatSet, StripDay } from '@/types/stats';

// The maths of Profile → Dashboard → Statistics and its screens, worked out from the logged sets (getStatSets in db/stats/statSets.ts).

export function between(sets: StatSet[], from: Date, to: Date): StatSet[] {
  const a = from.getTime();
  const b = to.getTime();
  return sets.filter((s) => {
    const t = startMsOf(s);
    return t >= a && t < b;
  });
}

// --- Last 7 days body graph ------------------------------------------------

// The 7 days up to today, oldest first.
export function lastSevenDays(sets: StatSet[], now = new Date()): StripDay[] {
  const today = startOfDay(now);
  const dates = Array.from({ length: 7 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + i));
  // Older sets can't land in the strip: skipped before a Date is built for them.
  const from = dates[0].getTime();
  const trained = new Set<number>();
  for (const s of sets) {
    const t = startMsOf(s);
    if (t >= from) trained.add(startOfDay(new Date(t)).getTime());
  }
  return dates.map((date) => ({ date, trained: trained.has(date.getTime()) }));
}

// The hard-set window of the 7 days: from the first day's midnight to the
// midnight after the last, by the calendar (+ 24 h is off by an hour across a DST change).
export function hardWindow(days: StripDay[]): [Date, Date] {
  const last = days[days.length - 1].date;
  return [days[0].date, new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1)];
}

// --- Set count per muscle group ----------------------------------------------

// Sets per primary muscle, most first (Cardio, Full Body and Other left out).
export function setsPerMuscle(sets: StatSet[]): MuscleCount[] {
  const counts = new Map<MuscleGroup, number>();
  for (const s of sets) {
    if (s.primary === 'Cardio' || s.primary === 'Full Body' || s.primary === 'Other') continue;
    counts.set(s.primary, (counts.get(s.primary) ?? 0) + 1);
  }
  return [...counts].map(([muscle, n]) => ({ muscle, sets: n })).sort((a, b) => b.sets - a.sets);
}

// --- "Nice work!" radar card ------------------------------------------------

// One per set, by its primary muscle; Cardio, Full Body and Other count nowhere.
export function setsPerBodyPart(sets: StatSet[]): Record<BodyPart, number> {
  const counts = Object.fromEntries(BODY_PARTS.map((p) => [p, 0])) as Record<BodyPart, number>;
  for (const s of sets) {
    const part = BODY_PART_OF[s.primary];
    if (part) counts[part] += 1;
  }
  return counts;
}

// The workout page's Muscle Split: each set
// counts 1 for its primary muscle's body part and ½ for each other part its
// secondary muscles reach (once per part). Most first, parts with nothing left out.
export function muscleSplit(sets: StatSet[]): SplitPart[] {
  const shares = new Map<BodyPart, number>();
  let total = 0;
  for (const s of sets) {
    const main = BODY_PART_OF[s.primary];
    const others = new Set<BodyPart>();
    for (const m of s.secondary) {
      const part = BODY_PART_OF[m];
      if (part && part !== main) others.add(part);
    }
    if (main) shares.set(main, (shares.get(main) ?? 0) + 1);
    for (const part of others) shares.set(part, (shares.get(part) ?? 0) + SPLIT_OTHER_PART_SHARE);
    total += (main ? 1 : 0) + others.size * SPLIT_OTHER_PART_SHARE;
  }
  return [...shares]
    .map(([part, n]) => ({ part, percent: Math.round((n / total) * 100) }))
    .sort((a, b) => b.percent - a.percent);
}

// Days from the first set to now (at least a week), for "a week" averages over All time.
export function daysLogged(sets: StatSet[], now = new Date()): number {
  if (sets.length === 0) return DAYS_PER_WEEK;
  const days = (now.getTime() - startMsOf(sets[0])) / MS_PER_DAY;
  return days >= DAYS_PER_WEEK ? days : DAYS_PER_WEEK;
}

// The period ending now and the one before it, `days` long each. Days by the
// calendar: on a clock change, today is 23 or 25 hours long.
export function periods(days: number, now = new Date()) {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - days);
  const before = new Date(start.getFullYear(), start.getMonth(), start.getDate() - days);
  return { current: [start, end] as const, previous: [before, start] as const };
}

// --- Main exercises --------------------------------------------------------

// Exercises by the number of workouts they were in, then sets. Warm Up is in
// nearly every workout, so it's left out (cardio stays).
export function mainExercises(sets: StatSet[]): MainExercise[] {
  const byExercise = new Map<string, MainExercise & { seen: Set<string> }>();
  for (const s of sets) {
    if (s.name.trim().toLowerCase() === WARM_UP_EXERCISE.toLowerCase()) continue;
    let e = byExercise.get(s.exerciseId);
    if (!e) {
      e = { exerciseId: s.exerciseId, name: s.name, catalogueId: s.catalogueId, workouts: 0, sets: 0, seen: new Set() };
      byExercise.set(s.exerciseId, e);
    }
    e.sets++;
    if (!e.seen.has(s.workoutId)) {
      e.seen.add(s.workoutId);
      e.workouts++;
    }
  }
  return [...byExercise.values()]
    .map(({ seen: _seen, ...e }) => e)
    .sort((a, b) => b.workouts - a.workouts || b.sets - a.sets);
}

// --- Monthly Report --------------------------------------------------------

// `throughDay` stops at that day of the month: a month still under way is
// compared with the same days of the one before.
export function monthReport(sets: StatSet[], year: number, month: number, throughDay?: number): MonthReport {
  const end = throughDay ? new Date(year, month, throughDay + 1) : new Date(year, month + 1, 1);
  const inMonth = between(sets, new Date(year, month, 1), end > new Date(year, month + 1, 1) ? new Date(year, month + 1, 1) : end);
  const workouts = new Map<string, number>();
  let volumeKg = 0;
  let reps = 0;
  const days = new Set<number>();
  for (const s of inMonth) {
    workouts.set(s.workoutId, s.durationSeconds);
    volumeKg += setVolumeKg(s.weightKg, s.reps, s.bodyWeightKg);
    reps += s.reps ?? 0;
    days.add(new Date(startMsOf(s)).getDate());
  }
  return {
    workouts: workouts.size,
    durationSeconds: [...workouts.values()].reduce((a, b) => a + b, 0),
    volumeKg,
    sets: inMonth.length,
    reps,
    days,
    topExercises: mainExercises(inMonth).slice(0, 3),
    muscles: setsPerMuscle(inMonth),
  };
}

// "+12%", "-5%", "" when there's nothing to compare with.
export function change(now: number, before: number): string {
  if (!before) return '';
  const pct = Math.round(((now - before) / before) * 100);
  return `${pct >= 0 ? '+' : ''}${pct}%`;
}
