import { describe, expect, it } from 'vitest';
import { inPeriod, periodIndex, periodStart } from './periods';
import { PERIODS } from '@/constants/periods';

describe('periods', () => {
  const now = new Date(2026, 9, 31, 10, 0);

  it('lists the same periods as the Profile chart, in order', () => {
    expect(PERIODS.map((p) => p.label)).toEqual([
      'Last 15 days',
      'Last 30 days',
      'Last 3 months',
      'Last 6 months',
      'Year',
      'All time',
    ]);
    expect(periodIndex('Last 3 months')).toBe(2);
  });

  it('counts whole days with today the last one', () => {
    expect(periodStart(15, now)).toEqual(new Date(2026, 9, 17));
    const sessions = [
      { startTime: new Date(2026, 9, 16, 23).toISOString() },
      { startTime: new Date(2026, 9, 17, 0, 30).toISOString() },
      { startTime: new Date(2026, 9, 31, 9).toISOString() },
    ];
    expect(inPeriod(sessions, 15, now)).toEqual(sessions.slice(1));
    expect(inPeriod(sessions, null, now)).toBe(sessions);
  });
});
