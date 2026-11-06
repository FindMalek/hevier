import { describe, expect, it } from 'vitest';
import { exerciseLines, radarPoint, recordValue, wedgePath } from './shareCardMaths';

describe('share card maths', () => {
  it('writes a record with its unit', () => {
    expect(recordValue('reps', 12)).toBe('12 reps');
    expect(recordValue('weight', 148.15)).toBe('148.15 kg');
    expect(recordValue('distance', 5.2)).toBe('5.2 km');
    expect(recordValue('duration', 90)).toBe('01:30');
  });

  it('keeps the first exercises and counts the rest', () => {
    expect(exerciseLines(['a', 'b', 'c'], 2)).toEqual({ shown: ['a', 'b'], more: 1 });
    expect(exerciseLines(['a'], 5)).toEqual({ shown: ['a'], more: 0 });
  });

  it('places radar points clockwise from the right', () => {
    const [x, y] = radarPoint(10, 90, 5);
    expect(x).toBeCloseTo(10);
    expect(y).toBeCloseTo(15);
    expect(radarPoint(10, 0, 5)).toEqual([15, 10]);
  });

  it('draws a wedge from the centre', () => {
    const d = wedgePath(10, 0, 5, 0);
    expect(d).toBe('M 10 10 L 15 10 A 5 5 0 0 1 15 10 Z');
  });
});
