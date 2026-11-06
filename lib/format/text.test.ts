import { describe, expect, it } from 'vitest';

import { plural } from './text';

describe('plural', () => {
  it('keeps the word for one', () => {
    expect(plural(1, 'set')).toBe('set');
  });

  it('adds an s for zero and many', () => {
    expect(plural(0, 'set')).toBe('sets');
    expect(plural(2, 'exercise')).toBe('exercises');
    expect(plural(1234, 'result')).toBe('results');
  });

  it('uses the given plural for irregular words', () => {
    expect(plural(1, 'match', 'matches')).toBe('match');
    expect(plural(3, 'match', 'matches')).toBe('matches');
  });
});
