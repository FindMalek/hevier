import { describe, expect, it } from 'vitest';
import { setVolumeKg } from './volume';

describe('setVolumeKg', () => {
  it('is weight × reps', () => {
    expect(setVolumeKg(80, 10)).toBe(800);
  });

  it('counts the body weight when the set has no weight', () => {
    expect(setVolumeKg(null, 10, 81.5)).toBe(815);
    // A logged weight wins (the body weight only fills in for none).
    expect(setVolumeKg(20, 10, 81.5)).toBe(200);
  });

  it('is 0 with nothing to count', () => {
    expect(setVolumeKg(null, 10)).toBe(0);
    expect(setVolumeKg(80, null)).toBe(0);
    expect(setVolumeKg(undefined, undefined, null)).toBe(0);
  });
});
