// "Lat Pulldown (Cable)" (as named in Hevy's export) was linked to the
// catalogue's full-range-of-motion pulldown (2330): the wrong clip. It is the
// bar lateral pulldown (0150), the classic wide grip pulldown, checked by eye
// (2291 "wide grip lat pulldown" is the same move on an unlinked female
// figure). It takes 0150's picture, muscles and instructions, keeping its own
// name and history; female pictures use 0150's linked female drawing. 2291
// leaves the list (constants/hiddenExercises.ts) unless something uses it.
export const sql = `
UPDATE exercises
SET (catalogue_id, body_part, target_muscle, secondary_muscles, equipment, category, description, instructions) = (
  SELECT catalogue_id, body_part, target_muscle, secondary_muscles, equipment, category, description, instructions
  FROM exercises WHERE catalogue_id = '0150' AND name <> 'Lat Pulldown (Cable)' LIMIT 1
)
WHERE name = 'Lat Pulldown (Cable)' AND catalogue_id = '2330'
  AND EXISTS (SELECT 1 FROM exercises WHERE catalogue_id = '0150' AND name <> 'Lat Pulldown (Cable)');

DELETE FROM exercises WHERE catalogue_id = '2291'
  AND id NOT IN (SELECT exercise_id FROM workout_exercises)
  AND id NOT IN (SELECT exercise_id FROM routine_exercises)
  AND NOT EXISTS (SELECT 1 FROM app_state WHERE value LIKE '%' || exercises.id || '%');
`;
