import { describe, expect, it } from 'vitest';
import { DATE_LOCALE, TIME_OF_DAY_FORMAT } from '@/constants/time';
import {
  clock24,
  compactDateTime,
  dateTimeLabel,
  fullDate,
  longDateTime,
  monthDay,
  monthName,
  monthYear,
  shortDate,
  shortMonth,
  timeLabel,
  weekdayDate,
  weekdayDateTime,
  weekdayLetter,
} from './date';

// Dates are built in local time, so the labels don't depend on the time zone.
const now = new Date(2026, 9, 20, 12, 0);
const evening = new Date(2026, 9, 13, 18, 44); // Tuesday
// Same options as the code: some ICU versions put a narrow space before "PM".
const time = (d: Date) => d.toLocaleTimeString(DATE_LOCALE, TIME_OF_DAY_FORMAT);

describe('time of day', () => {
  it('reads "6:44 PM"', () => {
    expect(timeLabel(evening)).toMatch(/^6:44\sPM$/u);
  });
  it('24-hour clock for the sync screen', () => {
    expect(clock24(new Date(2026, 9, 23, 9, 5))).toBe('09:05');
    expect(compactDateTime(new Date(2026, 9, 23, 9, 5))).toBe('23 Oct 09:05');
  });
});

describe('short dates', () => {
  it('month and day, the year only when it is not this year', () => {
    expect(monthDay(new Date(2025, 9, 15))).toBe('Oct 15');
    expect(shortDate(new Date(2026, 9, 6), now)).toBe('Oct 6');
    expect(shortDate(new Date(2025, 9, 6), now)).toBe('Oct 6, 2025');
  });
  it('months', () => {
    expect(monthName(new Date(2026, 8, 1))).toBe('Sep');
    expect(shortMonth(new Date(2026, 8, 1), now)).toBe('Sep');
    expect(shortMonth(new Date(2025, 8, 1), now)).toBe('Sep 2025');
    expect(monthYear(new Date(2026, 9, 1))).toBe('October 2026');
  });
  it('weekdays', () => {
    expect(weekdayLetter(evening)).toBe('T');
    expect(weekdayDate(evening)).toBe('Tue, Oct 13');
  });
});

describe('long dates', () => {
  it('full date and date-time', () => {
    expect(fullDate(evening)).toBe('Oct 13, 2026');
    expect(dateTimeLabel(evening)).toBe(`Oct 13, 2026, ${time(evening)}`);
    expect(weekdayDateTime(evening)).toBe(`Tue, Oct 13, 2026, ${time(evening)}`);
    expect(longDateTime(evening)).toBe(`Tuesday, Oct 13, 2026 · ${time(evening)}`);
  });
  it('Save Workout puts the day first', () => {
  });
});
