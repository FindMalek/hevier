import { describe, expect, it } from 'vitest';

import { footballFatigue, footballLeft, footballScale, ratingToRpe, rpeToRating } from './football';

describe('football', () => {
  it('a normal 90-minute game counts 1, longer games less per minute', () => {
    expect(footballScale(90)).toBeCloseTo(1);
    expect(footballScale(45)).toBeCloseTo(0.62, 2);
    expect(footballScale(108)).toBeCloseTo(1.14, 2);
    expect(footballScale(90, 'easy')).toBeCloseTo(0.7);
    expect(footballScale(90, 'hard')).toBeCloseTo(1.3);
    expect(footballScale(900)).toBeCloseTo(footballScale(150));
  });

  it('stays full for a day, then halves every 30 hours', () => {
    expect(footballLeft(0.8, 0)).toBe(0.8);
    expect(footballLeft(0.8, 24)).toBe(0.8);
    expect(footballLeft(0.8, 54)).toBeCloseTo(0.4);
    expect(footballLeft(0.8, -1)).toBe(0);
  });

  it('hamstrings: heavy for about a day and a half, ready around day three', () => {
    const at = (h: number) => footballFatigue(90, 'normal', h).get('Hamstrings')!;
    expect(at(30)).toBeGreaterThan(0.6); // Heavy recent load
    expect(at(48)).toBeLessThan(0.6);
    expect(at(48)).toBeGreaterThanOrEqual(0.3); // Partly recovered
    expect(at(72)).toBeLessThan(0.3); // Likely ready
    expect(footballFatigue(90, 'normal', 0).has('Biceps')).toBe(false);
  });

  it('keeps the rating in sets.rpe, normal when missing', () => {
    expect(rpeToRating(ratingToRpe('easy'))).toBe('easy');
    expect(rpeToRating(ratingToRpe('hard'))).toBe('hard');
    expect(rpeToRating(null)).toBe('normal');
  });
});
