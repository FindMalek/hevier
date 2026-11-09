// "Iso-Lateral Low Row" (as named in Hevy's export) was linked to the catalogue's
// alternating narrow grip seated row (0571): wrong picture and how-to, and no
// lats. It is the plate-loaded low row (4214): it
// takes that entry's picture, muscles and instructions, keeping its own name.
export const sql = `
UPDATE exercises
SET (catalogue_id, body_part, target_muscle, secondary_muscles, equipment, category, description, instructions) = (
  SELECT catalogue_id, body_part, target_muscle, secondary_muscles, equipment, category, description, instructions
  FROM exercises WHERE catalogue_id = '4214' AND name <> 'Iso-Lateral Low Row' LIMIT 1
)
WHERE name = 'Iso-Lateral Low Row' AND catalogue_id = '0571'
  AND EXISTS (SELECT 1 FROM exercises WHERE catalogue_id = '4214' AND name <> 'Iso-Lateral Low Row');
`;
