import { describe, it, expect } from 'vitest';
import initSqlJs from 'sql.js';
import { MIGRATIONS } from '../../db/migrations';
import { catalogueUpdate, femaleDrawings, fromOpenGym } from './catalogueUpdate';
import type { CatalogueEntry } from '@/types/import';

function entry(overrides: Partial<CatalogueEntry>): CatalogueEntry {
  return {
    id: '0739',
    name: 'sled 45° leg press',
    bodyPart: 'upper legs',
    equipment: 'sled machine',
    target: 'glutes',
    secondaryMuscles: ['quadriceps'],
    category: 'strength',
    description: "Push the sled's plate away.",
    instructions: ['Sit down.'],
    ...overrides,
  };
}

describe('fromOpenGym', () => {
  it('leaves out female drawings and hidden look-alikes of an exercise we already have', () => {
    const out = fromOpenGym([
      { ...entry({ id: '2801', name: 'twisted leg raise (female)' }), maleVariant: '2802' },
      { id: '2577', variantOf: '0223' },
      entry({ id: '2802', name: 'twisted leg raise' }),
      entry({ id: '0739' }),
      entry({ id: '0121', name: 'barbell upright row v. 3' }),
    ]);
    expect(out.map((e) => e.id)).toEqual(['0739', '2802']);
  });
});

describe('femaleDrawings', () => {
  it("links each kept exercise to its female drawing", () => {
    const files = [{ ...entry({ id: '0289' }), femaleVariant: '2254' }, { id: '2254', variantOf: '0289' }, { ...entry({ id: '0980' }), femaleVariant: '4035' }];
    expect(femaleDrawings(files, [entry({ id: '0289' })])).toEqual({ '0289': '2254' });
  });
});

describe('catalogueUpdate', () => {
  it('rewrites only the fields that changed, quotes escaped', () => {
    const { sql, removedIds } = catalogueUpdate(
      [entry({})],
      [entry({ target: 'quads', secondaryMuscles: ['glutes'], description: "It's the quads." })]
    );
    expect(removedIds).toEqual([]);
    expect(sql).toEqual([
      `UPDATE exercises SET target_muscle = 'quads', secondary_muscles = '["glutes"]', description = 'It''s the quads.' WHERE catalogue_id = '0739';`,
    ]);
  });

  it('changes an installed database, keeping removed entries that are used', async () => {
    const before = [entry({}), entry({ id: '2801', name: 'twisted leg raise (female)' }), entry({ id: '3236' })];
    const { sql } = catalogueUpdate(before, [entry({ target: 'quads' })]);

    const SQL = await initSqlJs();
    const db = new SQL.Database();
    for (const m of MIGRATIONS.slice(0, 12)) db.exec(m.sql);
    db.exec(`
      INSERT INTO exercises (id, name, type, catalogue_id, is_custom, target_muscle) VALUES
        ('lp', 'Leg Press (Machine)', 'weight_reps', '0739', 0, 'glutes'),
        ('f1', 'Twisted Leg Raise (female)', 'reps_only', '2801', 0, 'abs'),
        ('f2', 'Hip Thrusts on Knees (Band)', 'reps_only', '3236', 0, 'glutes');
      INSERT INTO workouts (id, title, start_time) VALUES ('w', 'LOWER A', '2026-10-06T18:56:00Z');
      INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index) VALUES ('we', 'w', 'f2', 0);
    `);
    db.exec(sql.join('\n'));

    expect(db.exec('SELECT id, target_muscle FROM exercises WHERE catalogue_id IS NOT NULL ORDER BY id')[0].values).toEqual([
      ['f2', 'glutes'],
      ['lp', 'quads'],
    ]);
  });
});
