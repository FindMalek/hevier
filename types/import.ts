import type { SetType } from './workout';

// One entry of catalogue/exercises.json (copied from openGym's catalogue).
export interface CatalogueEntry {
  id: string;
  name: string;
  bodyPart: string | null;
  equipment: string | null;
  target: string | null;
  secondaryMuscles: string[] | null;
  category: string | null;
  description: string | null;
  instructions: string[] | null;
}

// A Hevy CSV workout, turned into ours (scripts/import/parseCsv.ts).
export interface TransformedSet {
  setIndex: number;
  setType: SetType;
  weightKg: number | null;
  reps: number | null;
  distanceKm: number | null;
  durationSeconds: number | null;
  rpe: number | null;
}

export interface TransformedWorkoutExercise {
  exerciseName: string;
  notes: string | null;
  orderIndex: number;
  sets: TransformedSet[];
}

export interface TransformedWorkout {
  title: string;
  startTime: string;
  endTime: string | null;
  description: string | null;
  exercises: TransformedWorkoutExercise[];
}
