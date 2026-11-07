import type { MuscleGroup } from './muscles';
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

// One file of openGym's catalogue/exercises/. A female drawing is either a
// bare { id, variantOf } or, for a few, a full entry with maleVariant.
export type OpenGymEntry = Partial<CatalogueEntry> & {
  id: string;
  variantOf?: string;
  maleVariant?: string;
  femaleVariant?: string;
};

// A muscle fix for one movement (constants/muscleRules.ts).
export interface MuscleRule {
  name: string;
  match: RegExp;
  exclude?: RegExp;
  targets: string[];
  need: Partial<Record<MuscleGroup, string>>;
  drop: MuscleGroup[];
}

// What scripts/update-catalogue.ts makes of an openGym update.
export interface CatalogueUpdate {
  removedIds: string[];
  sql: string[];
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
