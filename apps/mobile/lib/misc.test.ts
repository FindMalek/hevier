import { describe, expect, it } from 'vitest';

import { idKey, noop } from './misc';

describe('misc', () => {
  it('noop returns nothing', () => {
    expect(noop()).toBeUndefined();
  });

  it('idKey keys a row by its id', () => {
    expect(idKey({ id: 'w1' })).toBe('w1');
  });
});
