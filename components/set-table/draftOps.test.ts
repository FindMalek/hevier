import { describe, expect, it } from 'vitest';
import { patchSet, removeByKey, updateByKey } from './draftOps';

const sets = [
  { key: 'a', reps: '5' },
  { key: 'b', reps: '8' },
];

describe('draftOps', () => {
  it('changes only the keyed item', () => {
    const out = updateByKey(sets, 'b', (s) => ({ ...s, reps: '9' }));
    expect(out).toEqual([{ key: 'a', reps: '5' }, { key: 'b', reps: '9' }]);
    expect(out[0]).toBe(sets[0]); // untouched items stay the same objects, so their rows don't redraw
  });

  it('patches a set with new values', () => {
    expect(patchSet(sets, 'a', { reps: '6' })[0]).toEqual({ key: 'a', reps: '6' });
  });

  it('removes the keyed item, also with number keys', () => {
    expect(removeByKey([{ key: 1 }, { key: 2 }], 1)).toEqual([{ key: 2 }]);
  });
});
