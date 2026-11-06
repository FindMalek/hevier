import { getDb } from '@/db/client';
import { muscleGroup, parseList, secondaryGroups } from '@/lib/domain/muscles';
import type { ExerciseDetail } from '@/types/exercise';
import { getExerciseHistory } from './history';
import { SELECT_EXERCISE_DETAIL } from './queries';
import type { ExerciseDetailRow } from './rows';

// The exercise page (what ⓘ in the picker and an exercise name on the routine
// page open).
export async function getExerciseDetail(id: string): Promise<ExerciseDetail | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ExerciseDetailRow>(SELECT_EXERCISE_DETAIL, [id]);
  if (!row) return null;
  const primary = muscleGroup(row.target_muscle, row.body_part);
  const history = await getExerciseHistory(id);
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    catalogueId: row.catalogue_id,
    primary,
    secondary: secondaryGroups(parseList(row.secondary_muscles), primary),
    description: row.description,
    instructions: parseList(row.instructions),
    sessions: history.map((h) => ({
      workoutId: h.workout.id,
      title: h.workout.title,
      startTime: h.workout.startTime,
      sets: h.sets,
    })),
  };
}
