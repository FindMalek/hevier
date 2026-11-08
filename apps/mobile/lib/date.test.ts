// Paris: 2026-10-25 is a 25-hour day, 2026-03-29 a 23-hour one. Each test file
// runs in its own worker, so the zone set here stays here.
import { describe, expect, it } from 'vitest';

import { dayKey, daysBetween, secondsSince, secondsUntil, shiftDays, startOfDay, startOfMonth, startOfWeek, weeksBetween } from './date';

process.env.TZ = 'Europe/Paris';

describe('dayKey', () => {
  it('pads month and day', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 10, 14))).toBe('2026-11-14');
  });
});

describe('startOf', () => {
  const d = new Date(2026, 9, 15, 18, 42); // Thursday
  it('day is local midnight', () => {
    expect(startOfDay(d)).toEqual(new Date(2026, 9, 15));
  });
  it('week starts on Monday', () => {
    expect(startOfWeek(d)).toEqual(new Date(2026, 9, 12));
    expect(startOfWeek(new Date(2026, 9, 18, 23))).toEqual(new Date(2026, 9, 12)); // Sunday
    expect(startOfWeek(new Date(2026, 9, 19))).toEqual(new Date(2026, 9, 19)); // Monday
    expect(startOfWeek(new Date(2026, 10, 1))).toEqual(new Date(2026, 9, 26)); // across months
  });
  it('month is the 1st', () => {
    expect(startOfMonth(d)).toEqual(new Date(2026, 9, 1));
  });
});

describe('daysBetween', () => {
  it('counts calendar days, whatever the hour', () => {
    expect(daysBetween(new Date(2026, 9, 14, 23).getTime(), new Date(2026, 9, 15, 1).getTime())).toBe(1);
    expect(daysBetween(new Date(2026, 9, 15, 1).getTime(), new Date(2026, 9, 15, 23).getTime())).toBe(0);
    expect(daysBetween(new Date(2026, 9, 1).getTime(), new Date(2026, 10, 1).getTime())).toBe(31);
  });
});

describe('shiftDays', () => {
  it('keeps the clock time across a clock change', () => {
    expect(shiftDays(new Date(2026, 9, 24, 6, 30), 2)).toEqual(new Date(2026, 9, 26, 6, 30)); // 25-hour day between
    expect(shiftDays(new Date(2026, 10, 1, 6, 30), -3)).toEqual(new Date(2026, 9, 29, 6, 30)); // across months
  });
});

describe('weeksBetween', () => {
  it('is whole days over 7', () => {
    expect(weeksBetween(new Date(2026, 9, 1), new Date(2026, 9, 29))).toBe(4);
    expect(weeksBetween(new Date(2026, 9, 1), new Date(2026, 9, 4))).toBeCloseTo(3 / 7);
  });
});

describe('secondsUntil', () => {
  const now = new Date(2026, 9, 15, 12).getTime();
  it('rounds up', () => {
    expect(secondsUntil(now + 1500, now)).toBe(2);
    expect(secondsUntil(now + 60_000, now)).toBe(60);
  });
  it('is never negative', () => {
    expect(secondsUntil(now - 5000, now)).toBe(0);
    expect(secondsUntil(now, now)).toBe(0);
  });
});

describe('secondsSince', () => {
  const now = new Date(2026, 9, 15, 12).getTime();
  it('starts at 0 and rounds down', () => {
    expect(secondsSince(now, now)).toBe(0);
    expect(secondsSince(now - 999, now)).toBe(0);
    expect(secondsSince(now - 61_500, now)).toBe(61);
  });
  it('is never negative', () => {
    expect(secondsSince(now + 5000, now)).toBe(0);
  });
});

describe('across a clock change', () => {
  it('days and weeks stay whole', () => {
    expect(daysBetween(new Date(2026, 9, 24, 12).getTime(), new Date(2026, 9, 26, 12).getTime())).toBe(2);
    expect(daysBetween(new Date(2026, 2, 28, 12).getTime(), new Date(2026, 2, 30, 12).getTime())).toBe(2);
    expect(weeksBetween(new Date(2026, 9, 19), new Date(2026, 9, 26))).toBe(1);
    expect(startOfWeek(new Date(2026, 9, 25, 23, 30))).toEqual(new Date(2026, 9, 19));
    expect(startOfDay(new Date(2026, 2, 29, 12))).toEqual(new Date(2026, 2, 29));
  });
});
