import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import initSqlJs from 'sql.js';
import { importCsvToDatabase } from './import-csv';
import type { CatalogueEntry } from '@/types/import';

const SAMPLE = `${__dirname}/fixtures/sample-workouts.csv`;
const loadCatalogue = () =>
  JSON.parse(fs.readFileSync(`${__dirname}/../catalogue/exercises.json`, 'utf-8')) as CatalogueEntry[];

async function importSample(catalogue: CatalogueEntry[] = []) {
  const bytes = await importCsvToDatabase(fs.readFileSync(SAMPLE, 'utf-8'), catalogue);
  const db = new (await initSqlJs()).Database(bytes);
  const one = (q: string) => db.exec(q)[0].values[0][0];
  const all = (q: string) => db.exec(q)[0]?.values ?? [];
  return { db, one, all };
}

// The fake export in scripts/fixtures: 6 workouts covering warm-up and failure
// sets, RPE, a reps-only, a timed and a distance exercise, dumbbell work, a
// football game and a tennis match (both logged as Sprints). Hevy's export has
// no routines, so none are made: the user builds them in the app.
describe('importCsvToDatabase (sample CSV)', () => {
  it('imports every workout, exercise and set', async () => {
    const { one } = await importSample();
    expect(one('SELECT COUNT(*) FROM workouts')).toBe(6);
    // 8 exercises in the CSV, plus Football, which every database gets (migration 006).
    expect(one('SELECT COUNT(*) FROM exercises')).toBe(9);
    expect(one('SELECT COUNT(*) FROM sets')).toBe(16);
    expect(one('PRAGMA user_version')).toBe(12);
    expect(one('SELECT COUNT(*) FROM routines')).toBe(0);
  });

  it('works out each exercise type from the columns used', async () => {
    const { all } = await importSample();
    const types = Object.fromEntries(all('SELECT name, type FROM exercises'));
    expect(types['Squat (Machine)']).toBe('weight_reps');
    expect(types['Pull Up']).toBe('reps_only');
    expect(types['Warm Up']).toBe('duration');
    expect(types['Running']).toBe('distance_duration');
  });

  it('keeps set types, RPE, notes and the description', async () => {
    const { all, one } = await importSample();
    const squat = all(
      `SELECT s.set_type, s.weight_kg, s.reps, s.rpe FROM sets s
       JOIN workout_exercises we ON we.id = s.workout_exercise_id JOIN exercises e ON e.id = we.exercise_id
       JOIN workouts w ON w.id = we.workout_id
       WHERE e.name = 'Squat (Machine)' AND w.start_time = (SELECT MIN(start_time) FROM workouts) ORDER BY s.set_index`
    );
    expect(squat).toEqual([
      ['warmup', 60, 10, null],
      ['normal', 100, 10, null],
      ['failure', 100, 8, 9],
    ]);
    expect(one("SELECT we.notes FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id WHERE e.name = 'Romanian Deadlift (Dumbbell)'")).toBe('heavy');
    expect(one("SELECT description FROM workouts WHERE title = 'UPPER A'")).toBe('Good session');
  });

  it('files "Foot…" games under Football and leaves Tennis as Sprints', async () => {
    const { all } = await importSample();
    const rows = Object.fromEntries(
      all(`SELECT w.title, e.name FROM workouts w JOIN workout_exercises we ON we.workout_id = w.id
           JOIN exercises e ON e.id = we.exercise_id WHERE e.name IN ('Sprints', 'Football')`)
    );
    expect(rows).toEqual({ Football: 'Football', Tennis: 'Sprints' });
  });

  it('links the exercises to the catalogue and adds the rest as a library', async () => {
    const catalogue = loadCatalogue();
    const { one } = await importSample(catalogue);
    expect(one("SELECT catalogue_id FROM exercises WHERE name = 'Squat (Machine)'")).toBe('1875');
    expect(one("SELECT type FROM exercises WHERE name = 'Pull Up'")).toBe('reps_only');
    expect(one("SELECT is_custom FROM exercises WHERE name = 'Warm Up'")).toBe(1);
    expect(one('SELECT COUNT(DISTINCT catalogue_id) FROM exercises WHERE catalogue_id IS NOT NULL')).toBe(catalogue.length);
    // 8 CSV exercises + Football + the catalogue minus the 7 entries they link to.
    expect(one('SELECT COUNT(*) FROM exercises')).toBe(8 + 1 + catalogue.length - 7);
  });
});
