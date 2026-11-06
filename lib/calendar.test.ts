import { describe, expect, it } from 'vitest';

import { dayCellTitle, groupByDay, monthWeeks, monthsSince, restDays, yearWeeks } from './calendar';

const at = (y: number, m: number, d: number, h = 18) => new Date(y, m, d, h).toISOString();

describe('calendar', () => {
  it("labels days: 'UPPER B', 'Evening'", () => {
    expect(dayCellTitle('UPPER B')).toBe('UPPER B');
    expect(dayCellTitle('Evening workout 🏋️')).toBe('Evening');
    expect(dayCellTitle('Tennis')).toBe('Tennis');
  });

  it('September 2026 starts on a Tuesday and has 5 weeks', () => {
    const weeks = monthWeeks(2026, 8);
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]?.getDate()).toBe(1);
    expect(weeks[4].map((d) => d?.getDate() ?? null)).toEqual([28, 29, 30, null, null, null, null]);
  });

  it('counts rest days since the last workout', () => {
    const days = groupByDay([
      { id: 'a', title: 'UPPER B', startTime: at(2026, 9, 13) },
      { id: 'b', title: 'LOWER A', startTime: at(2026, 9, 6) },
    ]);
    expect(restDays(days, new Date(2026, 9, 13, 21))).toBe(0);
    expect(restDays(days, new Date(2026, 9, 18, 9))).toBe(5);
  });

  it('lists months from the first workout to now', () => {
    const days = groupByDay([{ id: 'a', title: 'x', startTime: at(2025, 10, 3) }]);
    const months = monthsSince(days, new Date(2026, 1, 10));
    expect(months).toEqual([
      { year: 2025, month: 10 },
      { year: 2025, month: 11 },
      { year: 2026, month: 0 },
      { year: 2026, month: 1 },
    ]);
  });

  it('a year has 53 Monday-first week columns in 2026', () => {
    const weeks = yearWeeks(2026);
    expect(weeks).toHaveLength(53); // Jan 1 2026 is a Thursday
    expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
    expect(weeks[0][3]?.getDate()).toBe(1);
  });
});
