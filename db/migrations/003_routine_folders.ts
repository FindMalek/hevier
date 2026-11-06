// Routines go into collapsible folders, each with its own order.
// Routines with folder_id NULL appear in the built-in "My Routines" section.
// app_state holds small UI preferences such as that section's collapsed flag.
export const sql = `
CREATE TABLE routine_folders (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  position   INTEGER NOT NULL,
  collapsed  INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE routines ADD COLUMN folder_id TEXT REFERENCES routine_folders(id);
ALTER TABLE routines ADD COLUMN position INTEGER NOT NULL DEFAULT 0;

CREATE TABLE app_state (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
`;
