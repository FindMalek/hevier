import { describe, expect, it } from 'vitest';
import { SET_FIELDS } from '@/constants/setFields';
import { slotsOf } from './fields';

describe('slotsOf', () => {
  it('puts a single value in the second column', () => {
    expect(slotsOf(SET_FIELDS.reps_only)).toEqual([null, SET_FIELDS.reps_only[0]]);
  });

  it('keeps two values as they are', () => {
    expect(slotsOf(SET_FIELDS.weight_reps)).toEqual(SET_FIELDS.weight_reps);
  });
});
