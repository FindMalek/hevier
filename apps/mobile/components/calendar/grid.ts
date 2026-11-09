import { DAYS_PER_WEEK } from '@/constants/time';
import type { WorkoutDays } from '@/types/calendar';
import type { GridCell, GridLayout } from './types';

// The maths of the Year and Multi-year grids.

// Cells are keyed y * 10000 + month * 100 + day (month 0-based): cheaper than
// building a "2026-10-13" string for each of the ~400 cells a year.
export function cellKey(y: number, m: number, d: number): number {
  return y * 10000 + m * 100 + d;
}

export function todayKey(now = new Date()): number {
  return cellKey(now.getFullYear(), now.getMonth(), now.getDate());
}

// The trained days of WorkoutDays ("2026-10-13") as cell keys.
export function trainedKeys(days: WorkoutDays): Set<number> {
  const set = new Set<number>();
  for (const key of days.keys()) {
    const [y, m, d] = key.split('-').map(Number);
    set.add(cellKey(y, m - 1, d));
  }
  return set;
}

// The years from the first workout's to this one, oldest first.
export function yearsSince(days: WorkoutDays, now = new Date()): number[] {
  let firstYear = now.getFullYear();
  for (const key of days.keys()) firstYear = Math.min(firstYear, Number(key.slice(0, 4)));
  const years = [];
  for (let y = firstYear; y <= now.getFullYear(); y++) years.push(y);
  return years;
}

// How many days before the 1st in a Monday-first week (0 = Monday).
function mondayOffset(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % DAYS_PER_WEEK;
}

function daysIn(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

// A month as Monday-first week rows (the Year view's mini grid).
export function miniMonthGrid(year: number, month: number): GridLayout {
  const offset = mondayOffset(year, month);
  const length = daysIn(year, month);
  const cells: GridCell[] = [];
  for (let d = 1; d <= length; d++) {
    const i = offset + d - 1;
    cells.push({ key: cellKey(year, month, d), col: i % DAYS_PER_WEEK, row: Math.floor(i / DAYS_PER_WEEK) });
  }
  return { cells, cols: DAYS_PER_WEEK, rows: Math.ceil((offset + length) / DAYS_PER_WEEK) };
}

// A year as Monday-first week columns, one row per weekday (the Multi-year view).
export function yearGrid(year: number): GridLayout {
  const cells: GridCell[] = [];
  let i = mondayOffset(year, 0);
  for (let m = 0; m < 12; m++) {
    const length = daysIn(year, m);
    for (let d = 1; d <= length; d++, i++) {
      cells.push({ key: cellKey(year, m, d), col: Math.floor(i / DAYS_PER_WEEK), row: i % DAYS_PER_WEEK });
    }
  }
  return { cells, cols: Math.ceil(i / DAYS_PER_WEEK), rows: DAYS_PER_WEEK };
}
