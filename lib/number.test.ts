import { describe, expect, it } from 'vitest';
import { finiteOr } from './number';

describe('finiteOr', () => {
  it('keeps real numbers and replaces NaN and Infinity', () => {
    expect(finiteOr(3.5)).toBe(3.5);
    expect(finiteOr(NaN)).toBe(0);
    expect(finiteOr(Infinity)).toBe(0);
    expect(finiteOr(-Infinity, 7)).toBe(7);
  });
});
