import { describe, expect, it } from 'vitest';
import { setBadges, parseClock, typeClock, parseNumber, previousLabel, perHandText, totalText, setValue } from './setFormat';

describe('set text', () => {
  it('shows and reads times', () => {
    expect(parseClock('6:23')).toBe(383);
    expect(parseClock('383')).toBe(383);
    expect(parseClock('')).toBeNull();
  });

  it('puts the colon in while typing digits', () => {
    expect(typeClock('1')).toBe('00:01');
    expect(typeClock('10')).toBe('00:10');
    expect(typeClock('100')).toBe('01:00');
    expect(typeClock('1000')).toBe('10:00');
    expect(typeClock('01:000')).toBe('10:00'); // a digit typed after "01:00"
    expect(typeClock('01:0')).toBe('00:10'); // backspace on "01:00"
    expect(typeClock('00:0')).toBe('');
    expect(parseClock(typeClock('130'))).toBe(90);
  });

  it('reads weights with a comma or a dot', () => {
    expect(parseNumber('22,5')).toBe(22.5);
    expect(parseNumber('abc')).toBeNull();
  });

  it("writes the PREVIOUS column", () => {
    const s = { weightKg: 120, reps: 10, distanceKm: null, durationSeconds: 470 };
    expect(previousLabel('weight_reps', s)).toBe('120kg x 10');
    expect(previousLabel('reps_only', s)).toBe('x 10');
    expect(previousLabel('duration', s)).toBe('07:50');
    expect(previousLabel('weight_reps', undefined)).toBe('-');
  });
});

describe('setBadges', () => {
  it('W for warm-ups, F for failure, and the normal sets numbered on their own', () => {
    expect(setBadges(['warmup', 'normal', 'normal', 'failure', 'normal'])).toEqual(['W', '1', '2', 'F', '3']);
    expect(setBadges([])).toEqual([]);
  });

  it('dumbbells per hand: the box shows one dumbbell, the set keeps the total', () => {
    expect(perHandText('30')).toBe('15');
    expect(perHandText('25')).toBe('12.5');
    expect(perHandText('')).toBe('');
    expect(totalText('15')).toBe('30');
    expect(totalText('12,5')).toBe('25');
    expect(totalText('12.')).toBe('24');
    expect(totalText('7.3')).toBe('14.6');
    expect(totalText('')).toBe('');
    expect(previousLabel('weight_reps', { weightKg: 30, reps: 10, distanceKm: null, durationSeconds: null }, true)).toBe(
      '15kg x 10'
    );
  });
});

describe('workout page set values', () => {
  const set = (v: Partial<{ weightKg: number; reps: number; distanceKm: number; durationSeconds: number }>) => ({
    weightKg: null,
    reps: null,
    distanceKm: null,
    durationSeconds: null,
    ...v,
  });

  it('writes weight and reps, per hand, or reps alone without weight', () => {
    expect(setValue('weight_reps', set({ weightKg: 80, reps: 10 }))).toBe('80kg x 10');
    expect(setValue('weight_reps', set({ weightKg: 30, reps: 10 }), true)).toBe('15kg each x 10');
    expect(setValue('weight_reps', set({ reps: 12 }))).toBe('12 reps');
  });

  it('writes reps, times and distances', () => {
    expect(setValue('reps_only', set({ reps: 12 }))).toBe('12 reps');
    expect(setValue('duration', set({ durationSeconds: 383 }))).toBe('06:23');
    expect(setValue('duration', set({}))).toBe('-');
    expect(setValue('distance_duration', set({ distanceKm: 2.5, durationSeconds: 720 }))).toBe('2.5km - 12:00');
  });
});
