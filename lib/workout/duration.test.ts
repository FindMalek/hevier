import { describe, expect, it } from 'vitest';
import { durationSecondsOf } from './duration';

describe('durationSecondsOf', () => {
  it('returns the seconds between start and end', () => {
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', '2026-01-01T11:02:03.000Z')).toBe(3723);
  });

  it('returns 0 when there is no end time', () => {
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', null)).toBe(0);
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', undefined)).toBe(0);
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', '')).toBe(0);
  });

  it('clamps an end before the start to 0', () => {
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', '2026-01-01T09:00:00.000Z')).toBe(0);
  });

  it('rounds to the nearest second', () => {
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', '2026-01-01T10:00:01.499Z')).toBe(1);
    expect(durationSecondsOf('2026-01-01T10:00:00.000Z', '2026-01-01T10:00:01.500Z')).toBe(2);
  });
});
