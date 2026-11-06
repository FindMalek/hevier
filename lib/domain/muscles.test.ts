import { describe, expect, it } from 'vitest';

import { equipmentGroup, muscleGroup, parseList, secondaryGroups } from './muscles';

describe('muscles', () => {
  it('names muscles by group', () => {
    expect(muscleGroup('pectorals', 'chest')).toBe('Chest');
    expect(muscleGroup('quads', 'upper legs')).toBe('Quadriceps');
    expect(muscleGroup('cardiovascular system', 'cardio')).toBe('Cardio');
    expect(muscleGroup('glutes', 'full body')).toBe('Full Body');
    expect(muscleGroup(null, null)).toBe('Other');
  });

  it('groups equipment: cables are Machine', () => {
    expect(equipmentGroup('cable')).toBe('Machine');
    expect(equipmentGroup('body weight')).toBe('None');
    expect(equipmentGroup('ez barbell')).toBe('Barbell');
    expect(equipmentGroup('stability ball')).toBe('Other');
  });

  it("names secondary muscles by group, without the primary or repeats", () => {
    expect(secondaryGroups(['rhomboids', 'biceps', 'grip muscles', 'lats', 'upper back', 'ankles'], 'Lats')).toEqual([
      'Upper Back',
      'Biceps',
      'Forearms',
    ]);
  });

  it('reads a JSON list, empty when missing, not a list or broken', () => {
    expect(parseList('["a", 2]')).toEqual(['a', '2']);
    expect(parseList(null)).toEqual([]);
    expect(parseList('{"a":1}')).toEqual([]);
    expect(parseList('not json')).toEqual([]);
  });
});
