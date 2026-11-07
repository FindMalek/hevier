// The body weights logged on Profile → Body weight (or asked for on Save
// Workout). Body weight exercises (pull-ups, dips…) count the weight logged at
// the time of the workout as weight lifted (db/bodyWeight/queries.ts).
export const sql = `
CREATE TABLE body_weights (
  id         TEXT PRIMARY KEY,
  logged_at  TEXT NOT NULL,
  weight_kg  REAL NOT NULL
);
CREATE INDEX idx_body_weights_logged_at ON body_weights(logged_at);
`;
