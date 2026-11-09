import { describe, expect, it } from 'vitest';
import { nextInCycle } from './rotation';

describe('training cycle', () => {
  it('picks the routine after the last one done, wrapping around', () => {
    const cycle = [
      { id: 'ua', name: 'UPPER A' },
      { id: 'la', name: 'LOWER A' },
    ];
    expect(nextInCycle(cycle, null)).toBe(0);
    expect(nextInCycle(cycle, 'UPPER A')).toBe(1);
    expect(nextInCycle(cycle, 'LOWER A')).toBe(0);
  });
});
