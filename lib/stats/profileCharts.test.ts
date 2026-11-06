import { describe, expect, it } from 'vitest';
import { PROFILE_RANGES } from '@/constants/profile';
import { startOfWeek } from '@/lib/date';
import type { ProfileSession } from '@/types/profile';
import { barLabel, barScale, bars, headline, periodLabel, streakWeeks, tickLabel, totalHours } from './profileCharts';

const range = (label: string) => PROFILE_RANGES.find((r) => r.label === label)!;

const session = (startTime: string, hours: number, volumeKg = 0, reps = 0): ProfileSession => ({
  startTime,
  durationSeconds: hours * 3600,
  volumeKg,
  reps,
});
// A fixed "today": Tuesday 13 October 2026.
const now = new Date(2026, 9, 13, 20, 0);

describe('profile', () => {
  it('Last 15 / 30 days: a bar per day up to today; Last 6 months: 26 weeks', () => {
    const sessions = [
      session(new Date(2026, 8, 28, 18).toISOString(), 1, 0, 40), // before the 15 days
      session(new Date(2026, 9, 1, 18).toISOString(), 1, 0, 50),
      session(new Date(2026, 9, 13, 9).toISOString(), 1, 0, 30),
      session(new Date(2026, 9, 13, 18).toISOString(), 1, 0, 20),
    ];
    const fifteen = bars(sessions, range('Last 15 days'), 'reps', now);
    expect(fifteen).toHaveLength(15);
    expect(fifteen[0].start).toEqual(new Date(2026, 8, 29));
    expect(fifteen[14]).toEqual({ start: new Date(2026, 9, 13), value: 50 });
    expect(fifteen.reduce((sum, b) => sum + b.value, 0)).toBe(100);
    const thirty = bars(sessions, range('Last 30 days'), 'reps', now);
    expect(thirty).toHaveLength(30);
    expect(thirty[0].start).toEqual(new Date(2026, 8, 14));
    expect(thirty.reduce((sum, b) => sum + b.value, 0)).toBe(140);
    const six = bars(sessions, range('Last 6 months'), 'reps', now);
    expect(six).toHaveLength(26);
    expect(six[25].start).toEqual(new Date(2026, 9, 12));
    expect(barLabel(new Date(2026, 9, 13), 'day', false)).toBe('Oct 13');
    expect(periodLabel(new Date(2026, 9, 13), 'day', now)).toBe('Oct 13');
    expect(periodLabel(new Date(2025, 9, 13), 'day', now)).toBe('Oct 13, 2025');
  });

  it('weeks start on Monday', () => {
    expect(startOfWeek(new Date(2026, 9, 13))).toEqual(new Date(2026, 9, 12));
    expect(startOfWeek(new Date(2026, 9, 18, 23))).toEqual(new Date(2026, 9, 12));
    expect(startOfWeek(new Date(2026, 9, 19))).toEqual(new Date(2026, 9, 19));
  });

  it('Last 3 months: 12 weekly bars from Jul 27 to this week', () => {
    const sessions = [
      session(new Date(2026, 6, 20, 18).toISOString(), 3), // before the range
      session(new Date(2026, 6, 28, 18).toISOString(), 1.5),
      session(new Date(2026, 6, 30, 18).toISOString(), 1),
      session(new Date(2026, 9, 13, 18).toISOString(), 1),
    ];
    const result = bars(sessions, range('Last 3 months'), 'duration', now);
    expect(result).toHaveLength(12);
    expect(barLabel(result[0].start, 'week', false)).toBe('Jul 27');
    expect(result[0].value).toBe(2.5);
    expect(result[11].value).toBe(1);
    expect(result.slice(1, 11).every((b) => b.value === 0)).toBe(true);
  });

  it('Year: a bar per month; All time starts at the first workout', () => {
    expect(bars([], range('Year'), 'reps', now)).toHaveLength(12);
    const all = bars([session(new Date(2025, 10, 3).toISOString(), 1, 0, 50)], range('All time'), 'reps', now);
    expect(all).toHaveLength(12); // Nov 2025 … Oct 2026
    expect(all[0].value).toBe(50);
    expect(barLabel(all[0].start, 'month', true)).toBe('Nov 25');
  });

  it('streak counts weeks in a row, this week or last', () => {
    const weeks = (...days: number[][]) => days.map(([m, d]) => session(new Date(2026, m, d, 18).toISOString(), 1));
    expect(streakWeeks(weeks([9, 13], [9, 6], [8, 29], [8, 15]), now)).toBe(3);
    expect(streakWeeks(weeks([9, 6], [8, 29]), now)).toBe(2); // this week still empty
    expect(streakWeeks(weeks([8, 29]), now)).toBe(0);
  });

  it('total hours', () => {
    expect(totalHours([session('2026-10-01T10:00:00Z', 1.2), session('2026-10-02T10:00:00Z', 1.5)])).toBe(3);
  });

  it("formats totals: '2 hours', '19k kg', '270 Reps'", () => {
    expect(headline(2.2, 'duration')).toBe('2 hours');
    expect(headline(1, 'duration')).toBe('1 hour');
    expect(headline(0.75, 'duration')).toBe('45 min');
    expect(headline(19200, 'volume')).toBe('19k kg');
    expect(headline(800, 'volume')).toBe('800 kg');
    expect(headline(270, 'reps')).toBe('270 Reps');
  });

  it("puts the grid at 1/2/5 steps: 2 hrs, 10k kg, 100 reps", () => {
    expect(barScale([4.1, 5.6, 2.2]).ticks).toEqual([0, 2, 4]);
    const volume = barScale([19000, 22500, 6000]);
    expect(volume.ticks.map((t) => tickLabel(t, volume.step, 'volume'))).toEqual(['0k kg', '10k kg', '20k kg']);
    expect(barScale([360, 110]).ticks.map((t) => tickLabel(t, 100, 'reps'))).toEqual([
      '0 reps',
      '100 reps',
      '200 reps',
      '300 reps',
    ]);
    expect(barScale([0, 0])).toEqual({ max: 1, step: 1, ticks: [0] });
  });

  it("names a tapped bar's period", () => {
    expect(periodLabel(new Date(2026, 9, 5), 'week', now)).toBe('Oct 5 – 11');
    expect(periodLabel(new Date(2026, 8, 28), 'week', now)).toBe('Sep 28 – Oct 4');
    expect(periodLabel(new Date(2025, 11, 29), 'week', now)).toBe('Dec 29 – Jan 4');
    expect(periodLabel(new Date(2024, 11, 30), 'week', now)).toBe('Dec 30 – Jan 5, 2025');
    expect(periodLabel(new Date(2026, 8, 1), 'month', now)).toBe('Sep');
    expect(periodLabel(new Date(2025, 8, 1), 'month', now)).toBe('Sep 2025');
  });
});
