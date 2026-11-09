import { describe, expect, it } from 'vitest';
import { clock, elapsedLabel, pad2, recordDurationLabel, restLabel, timerLabel, watchLabel } from './duration';

describe('pad2', () => {
  it('pads to two digits', () => {
    expect(pad2(5)).toBe('05');
    expect(pad2(0)).toBe('00');
    expect(pad2(42)).toBe('42');
    expect(pad2(123)).toBe('123');
  });
});

describe('clocks', () => {
  it('writes set times as mm:ss', () => {
    expect(clock(383)).toBe('06:23');
    expect(clock(0)).toBe('00:00');
    expect(clock(3900)).toBe('65:00');
    expect(clock(null)).toBe('');
  });

  it('writes the timer, rounding up and adding hours when needed', () => {
    expect(timerLabel(60_000)).toBe('01:00');
    expect(timerLabel(400)).toBe('00:01');
    expect(timerLabel(0)).toBe('00:00');
    expect(timerLabel(3_900_000)).toBe('1:05:00');
  });

  it('writes the stopwatch as hh:mm:ss', () => {
    expect(watchLabel(0)).toBe('00:00:00');
    expect(watchLabel(60_999)).toBe('00:01:00');
    expect(watchLabel(3_600_000)).toBe('01:00:00');
    expect(watchLabel(3_723_000)).toBe('01:02:03');
  });
});

describe('duration words', () => {
  it('writes rest timers', () => {
    expect(restLabel(null)).toBe('OFF');
    expect(restLabel(0)).toBe('OFF');
    expect(restLabel(165)).toBe('2min 45s');
    expect(restLabel(120)).toBe('2min 0s'); // as in "Rest Timer: 3min 0s"
    expect(restLabel(180)).toBe('3min 0s');
    expect(restLabel(45)).toBe('45s');
  });

  it('writes the Duration of a workout in progress', () => {
    expect(elapsedLabel(17)).toBe('17s');
    expect(elapsedLabel(-5)).toBe('0s');
    expect(elapsedLabel(65.9)).toBe('1min 5s');
    expect(elapsedLabel(69 * 60)).toBe('1h 9min');
    expect(elapsedLabel(3600 + 9 * 60 + 59)).toBe('1h 9min');
  });

  it('writes record durations, keeping seconds past an hour', () => {
    expect(recordDurationLabel(17)).toBe('17s');
    expect(recordDurationLabel(470)).toBe('7min 50s');
    expect(recordDurationLabel(4358)).toBe('1h 12min 38s');
    expect(recordDurationLabel(59.6)).toBe('1min 0s');
  });
});
