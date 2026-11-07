import { dayKey, daysBetween, startOfWeek } from '@/lib/date';
import type { CalendarWorkout, WorkoutDays } from '@/types/calendar';

// The Calendar screen's maths: grouping workouts by day, rest days, and the
// month / year / multi-year grids.

export function groupByDay(workouts: CalendarWorkout[]): WorkoutDays {
  const days: WorkoutDays = new Map();
  for (const w of workouts) {
    const key = dayKey(new Date(w.startTime));
    if (!days.has(key)) days.set(key, []);
    days.get(key)!.push({ id: w.id, title: w.title });
  }
  return days;
}

// The name under a day: a short title whole ("UPPER B"), a long one by its
// first word ("Evening workout 🏋️" → "Evening").
export function dayCellTitle(title: string): string {
  return title.length > 9 ? title.split(/\s+/)[0] : title;
}

// Days since the last workout ("0 rest days" on a training day).
export function restDays(days: WorkoutDays, now = new Date()): number {
  const keys = [...days.keys()].sort();
  if (keys.length === 0) return 0;
  const [y, m, d] = keys[keys.length - 1].split('-').map(Number);
  const last = new Date(y, m - 1, d);
  return Math.max(0, daysBetween(last.getTime(), now.getTime()));
}

// A month's weeks, Monday first; null where a week reaches into another month.
export function monthWeeks(year: number, month: number): (Date | null)[][] {
  const weeks: (Date | null)[][] = [];
  const first = new Date(year, month, 1);
  let week: (Date | null)[] = Array((first.getDay() + 6) % 7).fill(null);
  for (let d = first; d.getMonth() === month; d = new Date(year, month, d.getDate() + 1)) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);
  return weeks;
}

// Months from the first workout's to this one, oldest first.
export function monthsSince(days: WorkoutDays, now = new Date()): { year: number; month: number }[] {
  const keys = [...days.keys()].sort();
  const [fy, fm] = keys.length ? keys[0].split('-').map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const months = [];
  for (let y = fy, m = fm - 1; y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth()); ) {
    months.push({ year: y, month: m });
    m++;
    if (m === 12) {
      m = 0;
      y++;
    }
  }
  return months;
}

// Multi-year: a year's Monday-first week columns, each 7 days (null outside the year).
export function yearWeeks(year: number): (Date | null)[][] {
  const columns: (Date | null)[][] = [];
  for (let start = startOfWeek(new Date(year, 0, 1)); start.getFullYear() <= year; ) {
    const column: (Date | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      column.push(d.getFullYear() === year ? d : null);
    }
    columns.push(column);
    start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    if (start.getFullYear() > year) break;
  }
  return columns;
}
