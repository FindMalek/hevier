import { describe, expect, it } from 'vitest';
import type { StatSet } from '@/types/stats';
import { change, daysLogged, hardWindow, lastSevenDays, mainExercises, monthReport, muscleSplit, periods, setsPerBodyPart, setsPerMuscle } from './stats';

const set = (startTime: string, extra: Partial<StatSet> = {}): StatSet => ({
  workoutId: startTime,
  title: 'UPPER A',
  startTime,
  durationSeconds: 3600,
  exerciseId: 'bench',
  name: 'Bench Press',
  catalogueId: null,
  primary: 'Chest',
  secondary: ['Triceps', 'Shoulders'],
  weightKg: 80,
  reps: 10,
  ...extra,
});
const at = (m: number, d: number) => new Date(2026, m, d, 18).toISOString();

describe('statistics', () => {
  it('marks the days trained in the last 7', () => {
    const days = lastSevenDays([set(at(9, 12)), set(at(9, 14))], new Date(2026, 9, 14, 21));
    expect(days.map((d) => d.date.getDate())).toEqual([8, 9, 10, 11, 12, 13, 14]);
    expect(days.map((d) => d.trained)).toEqual([false, false, false, false, true, false, true]);
  });

  it('averages over a week when the first set has an unreadable start', () => {
    expect(daysLogged([set('not a date')], new Date(2026, 9, 14))).toBe(7);
  });

  it('counts sets per primary muscle, without cardio', () => {
    expect(
      setsPerMuscle([set(at(9, 1)), set(at(9, 1)), set(at(9, 2), { primary: 'Lats' }), set(at(9, 3), { primary: 'Cardio' })])
    ).toEqual([
      { muscle: 'Chest', sets: 2 },
      { muscle: 'Lats', sets: 1 },
    ]);
  });

  it('counts sets per body part for the radar card, primary muscle only', () => {
    expect(
      setsPerBodyPart([
        set(at(9, 1)),
        set(at(9, 1), { primary: 'Lats' }),
        set(at(9, 1), { primary: 'Traps' }),
        set(at(9, 1), { primary: 'Biceps' }),
        set(at(9, 1), { primary: 'Quadriceps' }),
        set(at(9, 1), { primary: 'Abdominals' }),
        set(at(9, 1), { primary: 'Full Body' }),
      ])
    ).toEqual({ Chest: 1, Arms: 1, Core: 1, Shoulders: 0, Back: 2, Legs: 1 });
  });

  it('muscle split: 1 for the primary part, half for each other part reached', () => {
    expect(
      muscleSplit([
        set(at(9, 1), { primary: 'Quadriceps', secondary: ['Glutes', 'Hamstrings'] }),
        set(at(9, 1), { primary: 'Glutes', secondary: ['Hamstrings', 'Lower Back'] }),
        set(at(9, 1), { primary: 'Full Body', secondary: [] }),
      ])
    ).toEqual([
      { part: 'Legs', percent: 80 },
      { part: 'Back', percent: 20 },
    ]);
    expect(muscleSplit([])).toEqual([]);
  });

  it('periods: the last 30 days and the 30 before', () => {
    const { current, previous } = periods(30, new Date(2026, 9, 18, 12));
    expect(current[0]).toEqual(new Date(2026, 8, 19));
    expect(current[1]).toEqual(new Date(2026, 9, 19));
    expect(previous[0]).toEqual(new Date(2026, 7, 20));
  });

  it('main exercises by workouts, then sets', () => {
    const main = mainExercises([
      set(at(9, 1)),
      set(at(9, 1)),
      set(at(9, 2), { exerciseId: 'pull', name: 'Pull Up' }),
      set(at(9, 3), { exerciseId: 'pull', name: 'Pull Up' }),
      set(at(9, 3), { exerciseId: 'warm', name: 'Warm Up', primary: 'Full Body' }),
      set(at(9, 4), { exerciseId: 'run', name: 'Running', primary: 'Cardio' }),
    ]);
    expect(main.map((e) => [e.name, e.workouts, e.sets])).toEqual([
      ['Pull Up', 2, 2],
      ['Bench Press', 1, 2],
      ['Running', 1, 1],
    ]);
  });

  it('monthly report', () => {
    const report = monthReport([set(at(9, 1)), set(at(9, 1)), set(at(9, 6)), set(at(8, 30))], 2026, 9);
    expect(report).toMatchObject({ workouts: 2, durationSeconds: 7200, volumeKg: 2400, sets: 3, reps: 30 });
    expect([...report.days]).toEqual([1, 6]);
    // Only the first 3 days, to compare with a month still under way.
    expect(monthReport([set(at(9, 1)), set(at(9, 6))], 2026, 9, 3).workouts).toBe(1);
    expect(change(12, 10)).toBe('+20%');
    expect(change(9, 10)).toBe('-10%');
    expect(change(5, 0)).toBe('');
  });
});

describe('hard window', () => {
  it('runs from the first day to the midnight after the last', () => {
    const days = lastSevenDays([], new Date(2026, 9, 14, 21));
    expect(hardWindow(days)).toEqual([new Date(2026, 9, 8), new Date(2026, 9, 15)]);
  });

  it('ends at midnight across a DST change', () => {
    // Clocks change on 25 Oct 2026 in Europe; the end is still a midnight.
    const days = lastSevenDays([], new Date(2026, 9, 25, 12));
    const [, end] = hardWindow(days);
    expect([end.getDate(), end.getHours()]).toEqual([26, 0]);
  });
});
