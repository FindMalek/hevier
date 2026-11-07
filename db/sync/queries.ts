// SQL for what the phone sends to the PC with each copy.

// How many workouts the database holds.
export const COUNT_WORKOUTS = `
  SELECT COUNT(*) AS n
  FROM workouts`;

// When the newest workout started (null when there is none).
export const SELECT_LAST_WORKOUT_START = `
  SELECT MAX(start_time) AS start_time
  FROM workouts`;

// A consistent copy of the open database at the given path.
export const VACUUM_INTO = `VACUUM INTO ?`;
