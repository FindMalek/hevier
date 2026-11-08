import { MAX_SCALE_MAGNITUDES, MAX_SCALE_TICKS } from '@/constants/profile';
import { SECONDS_PER_HOUR } from '@/constants/time';
import { SHORT_VOLUME_FROM_KG } from '@/constants/weight';
import { startOfDay, startOfMonth, startOfWeek } from '@/lib/date';
import { finiteOr } from '@/lib/number';
import { monthDay, monthName, shortDate, shortMonth } from '@/lib/format/date';
import { plural } from '@/lib/format/text';
import { shortVolumeLabel, thousandsLabel, volumeLabel } from '@/lib/format/weight';
import type { Bar, BarUnit, ProfileMetric, ProfileRange, ProfileSession } from '@/types/profile';

// The Profile tab's maths:
// Streak / Hours, and the bar chart of time, volume or reps with its labels.

const START_OF = { day: startOfDay, week: startOfWeek, month: startOfMonth };

// The bar `steps` after (or before, when negative) the one starting at d.
function step(d: Date, unit: BarUnit, steps = 1): Date {
  if (unit === 'month') return new Date(d.getFullYear(), d.getMonth() + steps, 1);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + steps * (unit === 'week' ? 7 : 1));
}

const METRIC_VALUES: Record<ProfileMetric, (s: ProfileSession) => number> = {
  duration: (s) => s.durationSeconds / SECONDS_PER_HOUR, // hours, so the grid lands on whole hours
  volume: (s) => s.volumeKg,
  reps: (s) => s.reps,
};

export function metricValue(s: ProfileSession, metric: ProfileMetric): number {
  return finiteOr(METRIC_VALUES[metric](s));
}

// One bar per day, week or month up to the current one, empty ones included.
export function bars(sessions: ProfileSession[], range: ProfileRange, metric: ProfileMetric, now = new Date()): Bar[] {
  const startOf = START_OF[range.unit];
  const last = startOf(now);
  const first =
    range.count !== null
      ? step(last, range.unit, 1 - range.count)
      : sessions.length
        ? startOf(new Date(sessions[0].startTime))
        : last;
  const result: Bar[] = [];
  for (let d = first; d <= last; d = step(d, range.unit)) result.push({ start: d, value: 0 });
  // Each session goes straight to the bar of its day (week, month) start, instead of
  // looking through every bar; the search stays for a start that doesn't match
  // one (never seen, but it gives the same answer).
  const byStart = new Map(result.map((b, i) => [b.start.getTime(), i]));
  const end = step(last, range.unit);
  for (const s of sessions) {
    const t = new Date(s.startTime);
    if (!(t < end)) continue;
    const i =
      byStart.get(startOf(t).getTime()) ??
      result.findIndex((b, j) => t >= b.start && (j === result.length - 1 || t < result[j + 1].start));
    if (i >= 0) result[i].value += metricValue(s, metric);
  }
  return result;
}

// Weeks in a row with at least one workout, up to this week (or last week,
// while this one is still empty).
export function streakWeeks(sessions: ProfileSession[], now = new Date()): number {
  const weeks = new Set(sessions.map((s) => startOfWeek(new Date(s.startTime)).getTime()));
  let week = startOfWeek(now);
  if (!weeks.has(week.getTime())) week = new Date(week.getFullYear(), week.getMonth(), week.getDate() - 7);
  let streak = 0;
  while (weeks.has(week.getTime())) {
    streak++;
    week = new Date(week.getFullYear(), week.getMonth(), week.getDate() - 7);
  }
  return streak;
}

export function totalHours(sessions: ProfileSession[]): number {
  return Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / SECONDS_PER_HOUR);
}

// "2 hours", "19k kg", "270 Reps": the line above the chart.
export function headline(value: number, metric: ProfileMetric): string {
  if (metric === 'duration') {
    if (value > 0 && value < 1) return `${Math.round(value * 60)} min`;
    const hours = Math.round(value);
    return `${hours} ${plural(hours, 'hour')}`;
  }
  if (metric === 'volume') return shortVolumeLabel(value);
  return `${Math.round(value)} Reps`;
}

// Y labels: "4 hrs", "20k kg" ("0k kg" too), "300 reps".
export function tickLabel(value: number, step: number, metric: ProfileMetric): string {
  if (metric === 'duration') return `${value} hrs`;
  if (metric === 'volume') return step >= SHORT_VOLUME_FROM_KG ? thousandsLabel(value) : volumeLabel(value);
  return `${value} reps`;
}

// Bars run from 0 to the tallest one; grid lines at the first 1/2/5 step
// that leaves at most four of them (2 hrs, 10k kg, 100 reps). Values that
// aren't finite numbers are ignored.
export function barScale(values: number[]) {
  const max = Math.max(0, ...values.filter(Number.isFinite));
  if (max === 0) return { max: 1, step: 1, ticks: [0] };
  let magnitude = 10 ** Math.floor(Math.log10(max / 4));
  let step = max;
  for (let i = 0; i < MAX_SCALE_MAGNITUDES; i++) {
    const s = [1, 2, 5].map((m) => m * magnitude).find((c) => max / c <= 4);
    if (s !== undefined) {
      step = s;
      break;
    }
    magnitude *= 10;
  }
  const ticks: number[] = [];
  for (let t = 0; t <= max + 1e-9 && ticks.length < MAX_SCALE_TICKS; t += step) ticks.push(Number(t.toPrecision(12)));
  return { max, step, ticks };
}

export function barLabel(start: Date, unit: BarUnit, withYear: boolean): string {
  if (unit !== 'month') return monthDay(start);
  const month = monthName(start);
  return withYear ? `${month} ${String(start.getFullYear()).slice(2)}` : month;
}

// A tapped bar's period: "Oct 14" (a day), "Oct 5 – 11", "Sep 28 – Oct 4",
// "Sep" (a month this year) or "Sep 2025".
export function periodLabel(start: Date, unit: BarUnit, now = new Date()): string {
  if (unit === 'day') return shortDate(start, now);
  if (unit === 'month') return shortMonth(start, now);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const from = monthDay(start);
  const to = end.getMonth() === start.getMonth() ? String(end.getDate()) : monthDay(end);
  const year = end.getFullYear() !== now.getFullYear() ? `, ${end.getFullYear()}` : '';
  return `${from} – ${to}${year}`;
}
