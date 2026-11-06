import { describe, expect, it, vi } from 'vitest';

import { RADAR_MUSCLES } from '@/constants/muscles';

vi.mock('@/db/client', () => ({ getDb: async () => null }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));
const { RINGS, periodLoad, periodSummary, radarScale, setsPerWorkout } = await import(
  './distribution'
);
type StatSet = import('@/types/stats').StatSet;

const set = (day: number, primary: StatSet['primary'], secondary: StatSet['secondary'] = []): StatSet => ({
  workoutId: `w${day}`,
  title: 'UPPER',
  startTime: new Date(2026, 9, day, 18).toISOString(),
  durationSeconds: 3600,
  exerciseId: primary,
  name: primary,
  catalogueId: null,
  primary,
  secondary,
  weightKg: 100,
  reps: 5,
});

describe('muscle distribution radar', () => {
  it('hard sets per week per muscle, secondary at half, forearms left out', () => {
    // Two weeks: 4 rows (lats, biceps and forearms secondary) and 2 bench sets.
    const sets = [
      ...Array.from({ length: 4 }, () => set(5, 'Lats', ['Biceps', 'Forearms'])),
      set(12, 'Chest', ['Triceps']),
      set(12, 'Chest', ['Triceps']),
    ];
    const load = periodLoad(sets, sets.map(() => 1), new Date(2026, 9, 5), new Date(2026, 9, 19));
    expect(load.perWeek.Lats).toBe(2);
    expect(load.perWeek.Biceps).toBe(1);
    expect(load.perWeek.Chest).toBe(1);
    expect(load.perWeek.Triceps).toBe(0.5);
    expect(load.perWeek.Quadriceps).toBe(0);
    expect(load.total).toBe(4 + 2 + 2 + 1); // forearms not counted
    expect(Object.keys(load.perWeek)).toEqual([...RADAR_MUSCLES]);
  });

  it('rings at the zone limits; the edge is 10 unless a muscle goes past it', () => {
    expect(RINGS).toEqual([3, 4]);
    const quiet = periodLoad([], [], new Date(2026, 9, 5), new Date(2026, 9, 19));
    expect(radarScale(quiet)).toBe(10);
    const busy = { ...quiet, perWeek: { ...quiet.perWeek, Chest: 14.3 } };
    expect(radarScale(quiet, busy)).toBe(16);
  });

  it("the cards: workouts, their duration, volume and every set in the period", () => {
    const sets = [
      set(5, 'Lats'),
      set(5, 'Lats'),
      { ...set(12, 'Chest'), durationSeconds: 1800, weightKg: null },
      set(25, 'Chest'), // after the period
    ];
    expect(periodSummary(sets, new Date(2026, 9, 5), new Date(2026, 9, 19))).toEqual({
      workouts: 2,
      durationSeconds: 3600 + 1800,
      volumeKg: 2 * 100 * 5,
      sets: 3,
    });
  });

  it('sets per workout', () => {
    expect(setsPerWorkout({ workouts: 13, durationSeconds: 0, volumeKg: 0, sets: 119 })).toBeCloseTo(9.15);
    expect(setsPerWorkout({ workouts: 0, durationSeconds: 0, volumeKg: 0, sets: 0 })).toBe(0);
  });
});
