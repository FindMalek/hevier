import { describe, expect, it } from 'vitest';
import { marks } from './placeholders';

describe('marks', () => {
  it('gives one ? per value', () => {
    expect(marks(3)).toBe('?, ?, ?');
    expect(marks(1)).toBe('?');
  });
});
