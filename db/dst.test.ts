// Clock changes: on 2026-10-25 Paris goes from summer to winter time, so that
// day is 25 hours long (and 2026-03-29 is 23). Each test file runs in its own
// worker, so the time zone set here stays here.
import { describe, expect, it, vi } from 'vitest';

process.env.TZ = 'Europe/Paris';

vi.mock('./client', () => ({ getDb: async () => null }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));
const { periods } = await import('@/lib/stats/stats');

describe('periods across a clock change', () => {
  it('ends at midnight after today on a 25-hour day', () => {
    expect(new Date(2026, 9, 25, 12).getTimezoneOffset()).toBe(-60); // the zone really is in effect
    const { current, previous } = periods(7, new Date(2026, 9, 25, 23, 30));
    expect(current[1]).toEqual(new Date(2026, 9, 26));
    expect(current[0]).toEqual(new Date(2026, 9, 19));
    expect(previous[0]).toEqual(new Date(2026, 9, 12));
  });

  it('and on a 23-hour day', () => {
    const { current } = periods(7, new Date(2026, 2, 29, 12));
    expect(current[1]).toEqual(new Date(2026, 2, 30));
    expect(current[0]).toEqual(new Date(2026, 2, 23));
  });
});

describe('sets a week across a clock change', () => {
  it('a 7-day period with the change in it is one week', async () => {
    const { pushPull } = await import('@/lib/training/pushPull');
    const { periodLoad } = await import('@/lib/training/distribution');
    const { current } = periods(7, new Date(2026, 9, 25, 12));
    const bench = {
      workoutId: 'w',
      title: 'UPPER',
      startTime: new Date(2026, 9, 22, 18).toISOString(),
      durationSeconds: 3600,
      exerciseId: 'bench',
      name: 'Bench Press (Barbell)',
      catalogueId: null,
      primary: 'Chest' as const,
      secondary: [],
      weightKg: 100,
      reps: 5,
    };
    const sets = Array.from({ length: 10 }, () => bench);
    expect(pushPull(sets, current[0], current[1]).push).toBe(10);
    expect(periodLoad(sets, sets.map(() => 1), current[0], current[1]).perWeek.Chest).toBe(10);
  });
});

describe('profile bars, one pass', () => {
  it('give exactly what searching every bar gave, across clock changes', async () => {
    const { bars, metricValue } = await import('@/lib/stats/profileCharts');
    const { PROFILE_RANGES } = await import('@/constants/profile');
    const { startOfWeek: weekStart } = await import('@/lib/date');
    type Session = import('@/types/profile').ProfileSession;
    // The first bars(), kept as the reference (day bars added since).
    const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
    const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const days = { day: 1, week: 7 };
    const next = (d: Date, unit: 'day' | 'week' | 'month', by = 1) =>
      unit === 'month'
        ? new Date(d.getFullYear(), d.getMonth() + by, 1)
        : new Date(d.getFullYear(), d.getMonth(), d.getDate() + by * days[unit]);
    const reference = (sessions: Session[], range: (typeof PROFILE_RANGES)[number], metric: 'duration' | 'volume' | 'reps', now: Date) => {
      const startOf = range.unit === 'day' ? dayStart : range.unit === 'week' ? weekStart : monthStart;
      const last = startOf(now);
      let first: Date;
      if (range.count !== null) {
        first = last;
        for (let i = 1; i < range.count; i++) first = next(first, range.unit, -1);
      } else {
        first = sessions.length ? startOf(new Date(sessions[0].startTime)) : last;
      }
      const result: { start: Date; value: number }[] = [];
      for (let d = first; d <= last; d = next(d, range.unit)) result.push({ start: d, value: 0 });
      for (const s of sessions) {
        const t = new Date(s.startTime);
        const i = result.findIndex((b, j) => t >= b.start && (j === result.length - 1 || t < result[j + 1].start));
        if (i >= 0 && t < next(last, range.unit)) result[i].value += metricValue(s, metric);
      }
      return result;
    };
    let seed = 11;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    for (let run = 0; run < 50; run++) {
      const sessions: Session[] = [];
      let t = Date.UTC(2024, 0, 1);
      for (let i = 0; i < 150; i++) {
        t += Math.floor(rnd() * 6 * 86_400_000);
        sessions.push({
          // Midnight-ish starts too, where a clock change would bite.
          startTime: rnd() < 0.02 ? 'bad' : new Date(t - (t % 3_600_000)).toISOString(),
          durationSeconds: Math.floor(rnd() * 7200),
          volumeKg: rnd() * 10000,
          reps: Math.floor(rnd() * 200),
        });
      }
      if (rnd() < 0.3) sessions.reverse();
      const now = new Date(Date.UTC(2025, Math.floor(rnd() * 24), 1 + Math.floor(rnd() * 27), Math.floor(rnd() * 24)));
      for (const range of PROFILE_RANGES) {
        for (const metric of ['duration', 'volume', 'reps'] as const) {
          expect(bars(sessions, range, metric, now)).toEqual(reference(sessions, range, metric, now));
        }
      }
    }
  });
});
