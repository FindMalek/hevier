import { describe, expect, it, vi } from 'vitest';
import { SET_FIELDS } from '@/constants/setFields';
import { DEFAULT_WORKOUT_SETTINGS } from '@/constants/defaults';
import { FOOTBALL } from '@/constants/football';
import type { ActiveExercise, ActiveSet } from '@/types/workout';

let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `id${++nextId}` }));
const { newSet, nextSetLike, orderByKeys, shouldAskRating, shouldAskRepsLeft } = await import('./activeWorkout');

const set = (from: Partial<ActiveSet>) => newSet(from);
const exercise = (name: string, sets: ActiveSet[]) => ({ key: name, name, sets }) as unknown as ActiveExercise;

describe('nextSetLike', () => {
  it('copies the last set’s values, not done, a normal set with its own key', () => {
    const last = set({ weight: '80', reps: '8', setType: 'failure', done: true });
    const next = nextSetLike([set({ weight: '60' }), last]);
    expect([next.weight, next.reps, next.setType, next.done]).toEqual(['80', '8', 'normal', false]);
    expect(next.key).not.toBe(last.key);
  });

  it('is empty when there is no set yet', () => {
    expect(nextSetLike([]).weight).toBe('');
  });
});

describe('orderByKeys', () => {
  it('puts the items in the order of the keys and skips unknown ones', () => {
    const list = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
    expect(orderByKeys(list, ['c', 'x', 'a', 'b']).map((i) => i.key)).toEqual(['c', 'a', 'b']);
  });
});

describe('shouldAskRepsLeft', () => {
  const on = { ...DEFAULT_WORKOUT_SETTINGS, repsLeft: true };
  it('asks after the last set is ticked, on exercises with reps', () => {
    expect(shouldAskRepsLeft(SET_FIELDS.weight_reps, set({ done: true }), on)).toBe(true);
    expect(shouldAskRepsLeft(SET_FIELDS.weight_reps, set({ done: false }), on)).toBe(false);
    expect(shouldAskRepsLeft(SET_FIELDS.duration, set({ done: true }), on)).toBe(false);
  });

  it('not on a failure set, nor when turned off', () => {
    expect(shouldAskRepsLeft(SET_FIELDS.weight_reps, set({ done: true, setType: 'failure' }), on)).toBe(false);
    expect(shouldAskRepsLeft(SET_FIELDS.weight_reps, set({ done: true }), { ...on, repsLeft: false })).toBe(false);
  });
});

describe('shouldAskRating', () => {
  it('asks once a Football game is ticked', () => {
    expect(shouldAskRating(exercise(FOOTBALL, [set({ done: true })]))).toBe(true);
    expect(shouldAskRating(exercise(FOOTBALL, [set({ done: false })]))).toBe(false);
    expect(shouldAskRating(exercise('Squat', [set({ done: true })]))).toBe(false);
  });
});
