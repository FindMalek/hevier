import { describe, expect, it } from 'vitest';

import { weightComparison } from './weightComparison';

describe('weight comparison', () => {
  it('picks the heaviest thing the volume reaches', () => {
    expect(weightComparison(7530)?.name).toBe('T-rex');
    expect(weightComparison(6999)?.name).toBe('elephant');
    expect(weightComparison(200000)?.name).toBe('blue whale');
  });

  it('says "a" or "an"', () => {
    expect(weightComparison(7530)?.line).toBe("That's like lifting a T-rex!");
    expect(weightComparison(5200)?.line).toBe("That's like lifting an elephant!");
  });

  it('nothing to compare under the lightest', () => {
    expect(weightComparison(0)).toBeNull();
    expect(weightComparison(2)).toBeNull();
  });
});
