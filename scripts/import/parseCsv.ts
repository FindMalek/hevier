import { parse } from 'csv-parse/sync';
import { CSV_COLUMNS, DISTANCE_COLUMNS, WEIGHT_COLUMNS } from '@/constants/hevyCsv';
import { KM_PER_MILE } from '@/constants/distance';
import { CONVERTED_DECIMALS, KG_PER_LB } from '@/constants/weight';
import type { ExerciseType } from '@/types/exercise';
import type { SetType } from '@/types/workout';
import type {
  CsvColumn,
  CsvRow,
  ParsedCsv,
  RawRow,
  SkippedRow,
  TransformOptions,
  TransformResult,
  TransformedWorkout,
  TransformedWorkoutExercise,
} from '@/types/import';
import { machineTimeZone, parseHevyDate } from './parseHevyDate';

// Hevy also has drop sets; Hevier doesn't, so they come in as normal sets.
function toSetType(value: string): SetType {
  return value === 'failure' || value === 'warmup' ? value : 'normal';
}

// A number column in the unit the app uses: Hevy's imperial exports have
// weight_lbs and distance_miles instead of weight_kg and distance_km.
function metricColumn(row: RawRow, metric: string, imperial: string, perUnit: number): string {
  if (metric in row) return row[metric] ?? '';
  const raw = (row[imperial] ?? '').trim();
  if (raw === '') return '';
  const value = Number(raw);
  return Number.isNaN(value) ? raw : String(Number((value * perUnit).toFixed(CONVERTED_DECIMALS)));
}

function missingColumns(header: string[]): string[] {
  const missing: string[] = CSV_COLUMNS.filter((column) => !header.includes(column));
  if (!header.includes(WEIGHT_COLUMNS.kg) && !header.includes(WEIGHT_COLUMNS.lbs)) missing.push(WEIGHT_COLUMNS.kg);
  if (!header.includes(DISTANCE_COLUMNS.km) && !header.includes(DISTANCE_COLUMNS.miles)) missing.push(DISTANCE_COLUMNS.km);
  return missing;
}

// A line with more or fewer fields than the header is left out, never read
// with its fields shifted into the wrong columns.
export function parseCsvText(text: string): ParsedCsv {
  const lines = parse(text, { skip_empty_lines: true, bom: true, relax_column_count: true }) as string[][];
  if (lines.length === 0) return { rows: [], skipped: [] };
  const [header, ...records] = lines;
  if (header.length === 1 && header[0].includes(';')) {
    throw new Error('This looks like a semicolon-separated file: export a comma-separated CSV');
  }
  const repeated = header.filter((name, index) => header.indexOf(name) !== index);
  if (repeated.length > 0) throw new Error(`CSV repeats the columns: ${[...new Set(repeated)].join(', ')}`);
  const missing = missingColumns(header);
  if (missing.length > 0) throw new Error(`CSV is missing columns: ${missing.join(', ')}`);
  const rows: CsvRow[] = [];
  const skipped: SkippedRow[] = [];
  records.forEach((record, index) => {
    const rowNumber = index + 1;
    if (record.every((field) => field.trim() === '')) return;
    if (record.length !== header.length) {
      skipped.push({ row: rowNumber, reason: `Expected ${header.length} fields, got ${record.length}` });
      return;
    }
    const raw: RawRow = Object.fromEntries(header.map((name, column) => [name, record[column]]));
    rows.push({
      ...(Object.fromEntries(CSV_COLUMNS.map((column) => [column, raw[column] ?? ''])) as Record<CsvColumn, string>),
      weight_kg: metricColumn(raw, WEIGHT_COLUMNS.kg, WEIGHT_COLUMNS.lbs, KG_PER_LB),
      distance_km: metricColumn(raw, DISTANCE_COLUMNS.km, DISTANCE_COLUMNS.miles, KM_PER_MILE),
      rowNumber,
    });
  });
  return { rows, skipped };
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) throw new Error(`Expected a number, got: "${value}"`);
  return parsed;
}

function inferExerciseType(rowsForExercise: CsvRow[]): ExerciseType | null {
  const hasDistance = rowsForExercise.some((row) => row.distance_km.trim() !== '');
  const hasDuration = rowsForExercise.some((row) => row.duration_seconds.trim() !== '');
  const hasWeight = rowsForExercise.some((row) => row.weight_kg.trim() !== '');
  const hasReps = rowsForExercise.some((row) => row.reps.trim() !== '');
  const distanceOnly = hasDistance && !hasWeight && !hasReps;
  if (hasDistance && (hasDuration || distanceOnly)) return 'distance_duration';
  if (hasDuration) return 'duration';
  if (hasWeight) return 'weight_reps';
  if (hasReps) return 'reps_only';
  return null;
}

// Throws what is wrong with a row: a value that is not a number or a date.
function checkRow(r: CsvRow, timeZone: string): void {
  if (r.set_index.trim() === '' || !Number.isFinite(Number(r.set_index))) {
    throw new Error(`Expected a set number, got: "${r.set_index}"`);
  }
  for (const value of [r.weight_kg, r.reps, r.distance_km, r.duration_seconds, r.rpe]) toNullableNumber(value);
  parseHevyDate(r.start_time, timeZone);
  if (r.end_time.trim() !== '') parseHevyDate(r.end_time, timeZone);
}

// Rows with a bad value, or of an exercise with no weight, reps, time or
// distance at all, are left out and reported in `skipped`.
export function transformRows(allRows: CsvRow[], { timeZone = machineTimeZone() }: TransformOptions = {}): TransformResult {
  const skipped: SkippedRow[] = [];
  const valid: { r: CsvRow; n: number }[] = [];
  allRows.forEach((r) => {
    try {
      checkRow(r, timeZone);
      valid.push({ r, n: r.rowNumber });
    } catch (error) {
      skipped.push({ row: r.rowNumber, reason: (error as Error).message });
    }
  });
  const rowsByExerciseName = new Map<string, CsvRow[]>();
  for (const { r } of valid) {
    const list = rowsByExerciseName.get(r.exercise_title) ?? [];
    list.push(r);
    rowsByExerciseName.set(r.exercise_title, list);
  }
  const exerciseTypes = new Map<string, ExerciseType>();
  for (const [name, exerciseRows] of rowsByExerciseName) {
    const type = inferExerciseType(exerciseRows);
    if (type) exerciseTypes.set(name, type);
  }
  const typed: CsvRow[] = [];
  for (const { r, n } of valid) {
    if (exerciseTypes.has(r.exercise_title)) typed.push(r);
    else skipped.push({ row: n, reason: `No weight, reps, time or distance for "${r.exercise_title}"` });
  }

  // group rows into sessions keyed by (title, start_time), preserving first-seen order
  const sessionOrder: string[] = [];
  const sessionRows = new Map<string, CsvRow[]>();
  for (const r of typed) {
    const key = `${r.title}\u0000${r.start_time}`;
    if (!sessionRows.has(key)) {
      sessionOrder.push(key);
      sessionRows.set(key, []);
    }
    sessionRows.get(key)!.push(r);
  }

  const workouts: TransformedWorkout[] = sessionOrder.map((key) => {
    const sRows = sessionRows.get(key)!;
    const first = sRows[0];

    const exerciseOrder: string[] = [];
    const exerciseRowsInSession = new Map<string, CsvRow[]>();
    for (const r of sRows) {
      if (!exerciseRowsInSession.has(r.exercise_title)) {
        exerciseOrder.push(r.exercise_title);
        exerciseRowsInSession.set(r.exercise_title, []);
      }
      exerciseRowsInSession.get(r.exercise_title)!.push(r);
    }

    const exercises: TransformedWorkoutExercise[] = exerciseOrder.map((name, orderIndex) => {
      const exRows = exerciseRowsInSession.get(name)!;
      const notes = exRows.find((r) => r.exercise_notes.trim() !== '')?.exercise_notes ?? null;
      return {
        exerciseName: name,
        notes,
        orderIndex,
        sets: exRows.map((r) => ({
          setIndex: Number(r.set_index),
          setType: toSetType(r.set_type),
          weightKg: toNullableNumber(r.weight_kg),
          reps: toNullableNumber(r.reps),
          distanceKm: toNullableNumber(r.distance_km),
          durationSeconds: toNullableNumber(r.duration_seconds),
          rpe: toNullableNumber(r.rpe),
        })),
      };
    });

    return {
      title: first.title,
      startTime: parseHevyDate(first.start_time, timeZone),
      endTime: first.end_time.trim() === '' ? null : parseHevyDate(first.end_time, timeZone),
      description: first.description.trim() === '' ? null : first.description,
      exercises,
    };
  });

  return { exerciseTypes, workouts, skipped: skipped.sort((a, b) => a.row - b.row) };
}
