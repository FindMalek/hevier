import { describe, expect, it } from 'vitest';
import { mediaIdFor } from './drawings';

describe('mediaIdFor', () => {
  it('uses the female drawing when there is one', () => {
    expect(mediaIdFor('0289', 'female')).toBe('2254'); // dumbbell bench press
    expect(mediaIdFor('0289', 'male')).toBe('0289');
    expect(mediaIdFor('0002', 'female')).toBe('0002'); // no female drawing
  });
});
