import { parse } from 'csv-parse/sync';
import type { ExerciseType } from '@/types/exercise';
import type { SetType } from '@/types/workout';
import type { TransformedWorkout, TransformedWorkoutExercise } from '@/types/import';

// Hevy also has drop sets; Hevier doesn't, so they come in as normal sets.
function toSetType(value: string): SetType {
  return value === 'failure' || value === 'warmup' ? value : 'normal';
}

export interface CsvRow {
  title: string;
  start_time: string;
  end_time: string;
  description: string;
  exercise_title: string;
  superset_id: string;
  exercise_notes: string;
  set_index: string;
  set_type: string;
  weight_kg: string;
  reps: string;
  distance_km: string;
  duration_seconds: string;
  rpe: string;
}

export function parseCsvText(text: string): CsvRow[] {
  return parse(text, { columns: true, skip_empty_lines: true }) as CsvRow[];
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (Number.isNaN(n)) throw new Error(`Expected a number, got: "${value}"`);
  return n;
}

function parseHevyDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`Could not parse date: "${value}"`);
  return d.toISOString();
}

function inferExerciseType(rowsForExercise: CsvRow[]): ExerciseType {
  const hasDistance = rowsForExercise.some((r) => r.distance_km.trim() !== '');
  const hasDuration = rowsForExercise.some((r) => r.duration_seconds.trim() !== '');
  const hasWeight = rowsForExercise.some((r) => r.weight_kg.trim() !== '');
  const hasReps = rowsForExercise.some((r) => r.reps.trim() !== '');
  if (hasDistance && hasDuration) return 'distance_duration';
  if (hasDuration) return 'duration';
  if (hasWeight) return 'weight_reps';
  if (hasReps) return 'reps_only';
  throw new Error(`Cannot infer exercise type for "${rowsForExercise[0].exercise_title}"`);
}

export interface TransformResult {
  exerciseTypes: Map<string, ExerciseType>;
  workouts: TransformedWorkout[];
}

export function transformRows(rows: CsvRow[]): TransformResult {
  const rowsByExerciseName = new Map<string, CsvRow[]>();
  for (const r of rows) {
    const list = rowsByExerciseName.get(r.exercise_title) ?? [];
    list.push(r);
    rowsByExerciseName.set(r.exercise_title, list);
  }
  const exerciseTypes = new Map<string, ExerciseType>();
  for (const [name, exerciseRows] of rowsByExerciseName) {
    exerciseTypes.set(name, inferExerciseType(exerciseRows));
  }

  // group rows into sessions keyed by (title, start_time), preserving first-seen order
  const sessionOrder: string[] = [];
  const sessionRows = new Map<string, CsvRow[]>();
  for (const r of rows) {
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
      startTime: parseHevyDate(first.start_time),
      endTime: first.end_time.trim() === '' ? null : parseHevyDate(first.end_time),
      description: first.description.trim() === '' ? null : first.description,
      exercises,
    };
  });

  return { exerciseTypes, workouts };
}
