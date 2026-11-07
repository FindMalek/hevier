import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import initSqlJs, { type Database } from 'sql.js';
import { MIGRATIONS } from '../db/migrations';
import { moveFootballSql } from '../db/migrations/006_football';
import { INSERT_SET, INSERT_WORKOUT, INSERT_WORKOUT_EXERCISE } from '../db/workouts/queries';
import { MAX_SKIPPED_SHARE, SHOWN_SKIPPED_ROWS, TIME_ZONE_ENV } from '@/constants/import';
import { parseCsvText, transformRows } from './import/parseCsv';
import { checkTimeZone, machineTimeZone } from './import/parseHevyDate';
import { catalogueExerciseType, toHevyName } from './import/catalogue';
import { HEVY_CATALOGUE_MAP } from './import/hevyCatalogueMap';
import { HEVY_OFFICIAL_NAMES } from './import/hevyOfficialNames';
import type { CatalogueEntry, ImportResult, SkippedRow, TransformOptions } from '@/types/import';

// One line per skipped row, the first few only.
export function describeSkipped(skipped: SkippedRow[], shown = SHOWN_SKIPPED_ROWS): string[] {
  const lines = skipped.slice(0, shown).map(({ row, reason }) => `  row ${row}: ${reason}`);
  if (skipped.length > shown) lines.push(`  ...and ${skipped.length - shown} more`);
  return lines;
}

export async function importCsvToDatabase(
  csvText: string,
  catalogue: CatalogueEntry[] = [],
  options: TransformOptions = {}
): Promise<ImportResult> {
  const parsed = parseCsvText(csvText);
  const transformed = transformRows(parsed.rows, options);
  const { exerciseTypes, workouts } = transformed;
  const skipped = [...parsed.skipped, ...transformed.skipped].sort((a, b) => a.row - b.row);
  const total = parsed.rows.length + parsed.skipped.length;
  if (workouts.length === 0 || skipped.length > total * MAX_SKIPPED_SHARE) {
    const reading = workouts.length === 0 ? 'No workouts could be read from the CSV' : 'Too many CSV rows could not be read';
    const count = total === 0 ? 'the CSV has no rows' : `${skipped.length} of ${total} rows skipped`;
    throw new Error([`${reading} (${count}).`, ...describeSkipped(skipped)].join('\n'));
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();
  for (const migration of MIGRATIONS) {
    db.exec(migration.sql);
  }
  // Without this the app would see version 0 and re-run every migration on
  // top of the existing tables.
  db.exec(`PRAGMA user_version = ${MIGRATIONS[MIGRATIONS.length - 1].version}`);

  const exerciseIds = new Map<string, string>();
  for (const [name, type] of exerciseTypes) {
    const id = crypto.randomUUID();
    exerciseIds.set(name, id);
    db.run('INSERT INTO exercises (id, name, type) VALUES (?, ?, ?)', [id, name, type]);
  }

  if (catalogue.length > 0) insertCatalogue(db, catalogue, exerciseIds);

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
  return { bytes: db.export(), skipped };
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
  const libraryEntries = catalogue.filter((e) => !linkedCatalogueIds.has(e.id));
  const official = libraryEntries.filter((e) => HEVY_OFFICIAL_NAMES[e.id]);
  const others = libraryEntries.filter((e) => !HEVY_OFFICIAL_NAMES[e.id]);
  const usedNames = new Set(userExerciseIds.keys());
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

const CATALOGUE_PATH = path.join(__dirname, '..', 'catalogue', 'exercises.json');

async function main() {
  const [csvPath, outPath] = process.argv.slice(2);
  if (!csvPath || !outPath) {
    console.error('Usage: npx tsx scripts/import-csv.ts <workouts.csv> <out.db>');
    process.exit(1);
  }
  const csvText = fs.readFileSync(csvPath, 'utf-8');
  const catalogue = JSON.parse(fs.readFileSync(CATALOGUE_PATH, 'utf-8')) as CatalogueEntry[];
  const timeZone = checkTimeZone(process.env[TIME_ZONE_ENV] || machineTimeZone());
  console.log(`Workout times are read in ${timeZone} (set ${TIME_ZONE_ENV}, for example Europe/Paris, to change).`);
  const { bytes, skipped } = await importCsvToDatabase(csvText, catalogue, { timeZone });
  fs.writeFileSync(outPath, Buffer.from(bytes));
  console.log(`Wrote ${outPath} (${bytes.length} bytes).`);
  if (skipped.length > 0) console.warn([`Skipped ${skipped.length} CSV rows:`, ...describeSkipped(skipped)].join('\n'));
}

if (require.main === module) {
  main().catch((error: Error) => {
    console.error(error.message);
    process.exit(1);
  });
}
