import { describe, expect, it } from 'vitest';
import { recoverySteps, widgetData } from './homeWidgets';

const session = (startTime: string, volumeKg: number) => ({ startTime, durationSeconds: 3600, volumeKg, reps: 0 });

describe('home widgets', () => {
  // Thursday 30 October 2026, local time.
  const now = new Date(2026, 9, 30, 12);

  it('sends workout days from the 1st of last month, once each', () => {
    const d = widgetData(
      [
        session(new Date(2026, 8, 30, 18).toISOString(), 100),
        session(new Date(2026, 9, 1, 18).toISOString(), 100),
        session(new Date(2026, 9, 6, 9).toISOString(), 100),
        session(new Date(2026, 9, 6, 19).toISOString(), 100),
      ],
      null,
      [],
      now
    );
    expect(d.days).toEqual(['2026-09-30', '2026-10-01', '2026-10-06']);
  });

  it('sums volume per day from the Monday of last week', () => {
    const d = widgetData(
      [
        session(new Date(2026, 9, 18, 18).toISOString(), 500), // Sunday before last week
        session(new Date(2026, 9, 19, 18).toISOString(), 1000), // Monday of last week
        session(new Date(2026, 9, 28, 9).toISOString(), 200),
        session(new Date(2026, 9, 28, 19).toISOString(), 300),
      ],
      null,
      [],
      now
    );
    expect(d.volume).toEqual({ '2026-10-19': 1000, '2026-10-28': 500 });
  });

  it('names the next routine of the cycle', () => {
    const cycle = {
      routines: [
        { id: 'a', name: 'UPPER A' },
        { id: 'b', name: 'LOWER A' },
      ],
      next: 1,
      nextExercises: ['Warm Up', 'Squat (Machine)'],
      last: null,
    };
    expect(widgetData([], cycle, [], now).cycle).toEqual({
      name: 'LOWER A',
      step: 2,
      total: 2,
      exercises: ['Warm Up', 'Squat (Machine)'],
    });
    expect(widgetData([], null, [], now).cycle).toBeNull();
  });

  it('keeps only the times the recovery colours change, for a week', () => {
    const start = new Date(2026, 9, 30, 21, 30);
    const h = (n: number) => start.getTime() + n * 3_600_000;
    // Red for 24 h, orange until 48 h, then green until 7 days, then nothing.
    const colorsAt = (t: Date): Record<string, string> => {
      const age = t.getTime() - start.getTime();
      if (age < h(24) - start.getTime()) return { CHEST: 'red' };
      if (age < h(48) - start.getTime()) return { CHEST: 'orange' };
      if (age < h(24 * 7) - start.getTime()) return { CHEST: 'green' };
      return {};
    };
    const steps = recoverySteps(colorsAt, start);
    expect(steps.map((s) => s.colors.CHEST)).toEqual(['red', 'orange', 'green']);
    expect(steps[0].at).toBe(start.getTime());
    expect(steps[1].at).toBe(h(24.5)); // checked on the hour: 22:00 the next day
    expect(steps[2].at).toBe(h(48.5));
  });
});
