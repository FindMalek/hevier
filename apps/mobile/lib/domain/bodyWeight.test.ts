import { describe, expect, it } from 'vitest';
import { bodyWeightChange, changeLabel, parseBodyWeight } from './bodyWeight';

describe('parseBodyWeight', () => {
  it('reads kg with a dot or a comma, rounded to one decimal', () => {
    expect(parseBodyWeight('82.5')).toBe(82.5);
    expect(parseBodyWeight(' 82,46 ')).toBe(82.5);
  });

  it('refuses empty, odd or out-of-range values', () => {
    expect(parseBodyWeight('')).toBeNull();
    expect(parseBodyWeight('abc')).toBeNull();
    expect(parseBodyWeight('5')).toBeNull();
    expect(parseBodyWeight('900')).toBeNull();
  });
});

describe('bodyWeightChange', () => {
  const entry = (loggedAt: string, weightKg: number) => ({ id: loggedAt, loggedAt, weightKg });

  it('is the last weight minus the first, since the first', () => {
    const change = bodyWeightChange([entry('2026-09-01', 80), entry('2026-10-01', 83), entry('2026-11-01', 81.7)]);
    expect(change).toEqual({ deltaKg: 1.7, since: '2026-09-01' });
  });

  it('needs two weights', () => {
    expect(bodyWeightChange([entry('2026-09-01', 80)])).toBeNull();
    expect(bodyWeightChange([])).toBeNull();
  });
});

describe('changeLabel', () => {
  it('says gained, lost or same', () => {
    expect(changeLabel(1.5)).toBe('Gained 1.5 kg');
    expect(changeLabel(-2)).toBe('Lost 2 kg');
    expect(changeLabel(0)).toBe('Same weight');
  });
});
