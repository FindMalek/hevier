import { describe, expect, it } from 'vitest';
import type { WorkoutDays } from '@/types/calendar';
import { cellKey, miniMonthGrid, todayKey, trainedKeys, yearGrid, yearsSince } from './grid';

const days: WorkoutDays = new Map([
  ['2024-03-05', []],
  ['2026-10-13', []],
]);

describe('calendar grid', () => {
  it('keys a day by year, 0-based month and day', () => {
    expect(cellKey(2026, 9, 13)).toBe(20260913);
    expect(todayKey(new Date(2026, 9, 13))).toBe(20260913);
  });

  it('turns trained days into cell keys', () => {
    expect([...trainedKeys(days)]).toEqual([20240205, 20260913]);
  });

  it('lists the years from the first workout to now', () => {
    expect(yearsSince(days, new Date(2026, 0, 1))).toEqual([2024, 2025, 2026]);
    expect(yearsSince(new Map(), new Date(2026, 0, 1))).toEqual([2026]);
  });

  it('lays a month out Monday first', () => {
    // 1 Oct 2026 is a Thursday: column 3 of the first row.
    const { cells, cols, rows } = miniMonthGrid(2026, 9);
    expect(cells[0]).toEqual({ key: 20260901, col: 3, row: 0 });
    expect(cells).toHaveLength(31);
    expect([cols, rows]).toEqual([7, 5]);
  });

  it('lays a year out in week columns', () => {
    // 1 Jan 2026 is a Thursday: row 3 of the first column.
    const { cells, cols, rows } = yearGrid(2026);
    expect(cells[0]).toEqual({ key: 20260001, col: 0, row: 3 });
    expect(cells).toHaveLength(365);
    expect([cols, rows]).toEqual([53, 7]);
  });
});
