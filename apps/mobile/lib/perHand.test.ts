import { describe, expect, it } from 'vitest';
import { canLogPerHand } from './perHand';

describe('per hand', () => {
  it('only two-dumbbell exercises get the switch', () => {
    expect(canLogPerHand('Bench Press (Dumbbell)', 'dumbbell')).toBe(true);
    expect(canLogPerHand('Bench Press (Barbell)', 'barbell')).toBe(false);
    expect(canLogPerHand('Single Arm Row (Dumbbell)', 'dumbbell')).toBe(false);
    expect(canLogPerHand('One Arm Row (Dumbbell)', 'dumbbell')).toBe(false);
    expect(canLogPerHand('One-Arm Shoulder Press', 'dumbbell')).toBe(false);
    expect(canLogPerHand('Unilateral Curl', 'dumbbell')).toBe(false);
    expect(canLogPerHand('Warm Up', null)).toBe(false);
  });
});
