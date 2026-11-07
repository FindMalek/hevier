// Links exercises to the openGym catalogue (packages/catalogue/exercises.json) and
// carries its muscle/equipment/instruction data. Exercises that came from the
// imported Hevy CSV and have no catalogue match stay is_custom = 1.
export const sql = `
ALTER TABLE exercises ADD COLUMN catalogue_id TEXT;
ALTER TABLE exercises ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 1;
ALTER TABLE exercises ADD COLUMN body_part TEXT;
ALTER TABLE exercises ADD COLUMN target_muscle TEXT;
ALTER TABLE exercises ADD COLUMN secondary_muscles TEXT; -- JSON array
ALTER TABLE exercises ADD COLUMN equipment TEXT;
ALTER TABLE exercises ADD COLUMN category TEXT;
ALTER TABLE exercises ADD COLUMN description TEXT;
ALTER TABLE exercises ADD COLUMN instructions TEXT; -- JSON array

CREATE INDEX idx_exercises_catalogue ON exercises(catalogue_id);
`;
