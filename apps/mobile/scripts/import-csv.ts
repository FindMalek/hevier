import fs from 'node:fs';
import crypto from 'node:crypto';
import initSqlJs, { type Database } from 'sql.js';
import { MIGRATIONS } from '../db/migrations';
import { moveFootballSql } from '../db/migrations/006_football';
import { INSERT_SET, INSERT_WORKOUT, INSERT_WORKOUT_EXERCISE } from '../db/workouts/queries';
import { parseCsvText, transformRows } from './import/parseCsv';
import { catalogueExerciseType, toHevyName } from './import/catalogue';
import { HEVY_CATALOGUE_MAP } from './import/hevyCatalogueMap';
import { HEVY_OFFICIAL_NAMES } from './import/hevyOfficialNames';
import { RUN, RUN_CATALOGUE_ID, RUN_IMPORT_NAMES } from '@/constants/run';
import catalogueJson from '@hevier/catalogue/exercises.json';
import type { CatalogueEntry } from '@/types/import';

export async function importCsvToDatabase(
  csvText: string,
  catalogue: CatalogueEntry[] = []
): Promise<Uint8Array> {
  const rows = parseCsvText(csvText);
  const { exerciseTypes, workouts } = transformRows(rows);

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  for (const migration of MIGRATIONS) {
    db.exec(migration.sql);
  }
  // Without this the app would see version 0 and re-run every migration on
  // top of the existing tables.
  db.exec(`PRAGMA user_version = ${MIGRATIONS[MIGRATIONS.length - 1].version}`);

  // Runs go to the built-in Run exercise (migration 015) instead of a copy of their own.
  const runId = db.exec('SELECT id FROM exercises WHERE name = ?', [RUN])[0].values[0][0] as string;
  const isRun = (name: string) => (RUN_IMPORT_NAMES as readonly string[]).includes(name);
  const exerciseIds = new Map<string, string>();
  const ownExerciseIds = new Map<string, string>();
  for (const [name, type] of exerciseTypes) {
    if (isRun(name)) {
      exerciseIds.set(name, runId);
      continue;
    }
    const id = crypto.randomUUID();
    exerciseIds.set(name, id);
    ownExerciseIds.set(name, id);
    db.run('INSERT INTO exercises (id, name, type) VALUES (?, ?, ?)', [id, name, type]);
  }

  if (catalogue.length > 0) insertCatalogue(db, catalogue, ownExerciseIds);

  for (const workout of workouts) {
    const workoutId = crypto.randomUUID();
    db.run(INSERT_WORKOUT, [workoutId, workout.title, workout.startTime, workout.endTime, workout.description]);

    for (const we of workout.exercises) {
      const exerciseId = exerciseIds.get(we.exerciseName);
      if (!exerciseId) throw new Error(`Unknown exercise: ${we.exerciseName}`);
      const workoutExerciseId = crypto.randomUUID();
      db.run(INSERT_WORKOUT_EXERCISE, [workoutExerciseId, workoutId, exerciseId, we.orderIndex, we.notes]);

      for (const s of we.sets) {
        db.run(INSERT_SET, [
          crypto.randomUUID(),
          workoutExerciseId,
          s.setIndex,
          s.setType,
          s.weightKg,
          s.reps,
          s.distanceKm,
          s.durationSeconds,
          s.rpe,
        ]);
      }
    }
  }

  db.exec(moveFootballSql);
  return db.export();
}

// Links the user's own exercises to their catalogue entry (keeping the user's
// name and logged type), then adds every remaining catalogue entry as a
// library exercise under Hevy's own name where known, else a Hevy-style one.
function insertCatalogue(db: Database, catalogue: CatalogueEntry[], userExerciseIds: Map<string, string>) {
  const byId = new Map(catalogue.map((e) => [e.id, e]));
  const linkedCatalogueIds = new Set<string>();

  for (const [name, exerciseId] of userExerciseIds) {
    const mapping = HEVY_CATALOGUE_MAP[name];
    if (mapping === undefined) continue; // unknown title: plain custom exercise
    if (typeof mapping !== 'string') {
      db.run(
        'UPDATE exercises SET is_custom = 1, body_part = ?, target_muscle = ?, equipment = ?, category = ? WHERE id = ?',
        [mapping.bodyPart, mapping.targetMuscle, mapping.equipment, mapping.category, exerciseId]
      );
      continue;
    }
    const entry = byId.get(mapping);
    if (!entry) throw new Error(`Catalogue id ${mapping} (for "${name}") not found`);
    linkedCatalogueIds.add(entry.id);
    db.run(
      `UPDATE exercises SET catalogue_id = ?, is_custom = 0, body_part = ?, target_muscle = ?, secondary_muscles = ?,
         equipment = ?, category = ?, description = ?, instructions = ? WHERE id = ?`,
      [...catalogueColumns(entry), exerciseId]
    );
  }

  // Hevy's own names are claimed first so a converted name never takes one.
  const libraryEntries = catalogue.filter((e) => e.id !== RUN_CATALOGUE_ID && !linkedCatalogueIds.has(e.id));
  const official = libraryEntries.filter((e) => HEVY_OFFICIAL_NAMES[e.id]);
  const others = libraryEntries.filter((e) => !HEVY_OFFICIAL_NAMES[e.id]);
  const usedNames = new Set(db.exec('SELECT name FROM exercises')[0].values.map((row) => row[0] as string));
  for (const entry of [...official, ...others]) {
    const base = HEVY_OFFICIAL_NAMES[entry.id] ?? toHevyName(entry.name);
    let name = base;
    for (let n = 2; usedNames.has(name); n++) name = `${base} #${n}`;
    usedNames.add(name);
    db.run(
      `INSERT INTO exercises (id, name, type, catalogue_id, is_custom, body_part, target_muscle, secondary_muscles,
         equipment, category, description, instructions) VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), name, catalogueExerciseType(entry), entry.id, ...catalogueColumns(entry).slice(1)]
    );
  }
}

function catalogueColumns(e: CatalogueEntry) {
  return [
    e.id,
    e.bodyPart,
    e.target,
    JSON.stringify(e.secondaryMuscles ?? []),
    e.equipment,
    e.category,
    e.description,
    JSON.stringify(e.instructions ?? []),
  ];
}

const CATALOGUE = catalogueJson as unknown as CatalogueEntry[];

async function main() {
  const [csvPath, outPath] = process.argv.slice(2);
  if (!csvPath || !outPath) {
    console.error('Usage: npx tsx scripts/import-csv.ts <workouts.csv> <out.db>');
    process.exit(1);
  }
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const bytes = await importCsvToDatabase(csvText, CATALOGUE);
  fs.writeFileSync(outPath, Buffer.from(bytes));
  console.log(`Wrote ${outPath} (${bytes.length} bytes)`);
}

if (require.main === module) {
  main();
}
