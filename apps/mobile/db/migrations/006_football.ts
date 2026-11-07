// Football (lib/training/football.ts): its own exercise, a duration, counted in the
// recovery view only. Games logged in Hevy as a single "Sprints" set move
// over when the workout is titled "Foot…". Tennis stays Sprints.
// Also run by scripts/import-csv.ts after a fresh import: the migrations run
// there before any workout exists.
export const moveFootballSql = `
UPDATE workout_exercises
SET exercise_id = (SELECT id FROM exercises WHERE name = 'Football')
WHERE exercise_id IN (SELECT id FROM exercises WHERE name = 'Sprints')
  AND workout_id IN (
    SELECT id FROM workouts
    WHERE lower(title) LIKE 'foot%'
  );
`;

export const sql = `
INSERT OR IGNORE INTO exercises (id, name, type, catalogue_id, is_custom, body_part, target_muscle, secondary_muscles, equipment, category)
VALUES ('football', 'Football', 'duration', NULL, 1, 'cardio', 'cardiovascular system', '[]', 'body weight', 'cardio');
${moveFootballSql}`;
