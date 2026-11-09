import { describe, expect, it, vi } from 'vitest';
import initSqlJs from 'sql.js';
import { runMigrations } from '@/db/migrations';
import { SELECT_SESSION_SETS } from '@/db/sessions/queries';
import { SELECT_WORKOUT_SETS } from '@/db/feed/queries';
import type { SessionSetRow } from '@/db/sessions/rows';

vi.mock('@/db/client', () => ({ getDb: async () => null }));
const { sessionsOf } = await import('@/db/sessions/sessions');

// The weight a body weight exercise's set counts, and the workout volumes it
// makes (db/sessions, lib/volume.ts), on an in-memory sql.js database.
const SQL = await initSqlJs();

async function database(bodyWeights: string) {
  const raw = new SQL.Database();
  await runMigrations({
    async execAsync(sqlText: string) {
      raw.exec(sqlText);
    },
    async getFirstAsync<T>(sqlText: string) {
      const r = raw.exec(sqlText);
      return (r.length ? Object.fromEntries(r[0].columns.map((c, i) => [c, r[0].values[0][i]])) : null) as T;
    },
  });
  raw.exec(`
    INSERT INTO exercises (id, name, type, equipment) VALUES
      ('pu', 'Pull Up', 'reps_only', 'body weight'),
      ('td', 'Triceps Dip', 'reps_only', 'leverage machine'),
      ('bp', 'Bench Press', 'weight_reps', 'barbell');
    INSERT INTO workouts (id, title, start_time) VALUES
      ('w1', 'UPPER B', '2026-10-01T18:00:00Z'), ('w2', 'UPPER B', '2026-11-06T18:00:00Z');
    INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index) VALUES
      ('a', 'w1', 'pu', 0), ('b', 'w1', 'td', 1), ('c', 'w2', 'pu', 0), ('d', 'w2', 'bp', 1);
    INSERT INTO sets (id, workout_exercise_id, set_index, set_type, weight_kg, reps) VALUES
      ('s1', 'a', 0, 'failure', NULL, 10), ('s2', 'b', 0, 'normal', NULL, 12),
      ('s3', 'c', 0, 'failure', NULL, 8), ('s4', 'd', 0, 'normal', 100, 5);
    ${bodyWeights}
  `);
  const volumes = () => {
    const r = raw.exec(SELECT_SESSION_SETS)[0];
    const rows = r.values.map((v) => Object.fromEntries(r.columns.map((c, i) => [c, v[i]])) as unknown as SessionSetRow);
    return sessionsOf(rows).map((s) => s.volumeKg);
  };
  const setWeights = () => raw.exec(SELECT_WORKOUT_SETS)[0].values.map((v) => v[v.length - 1]);
  return { volumes, setWeights };
}

describe('body weight in the volume', () => {
  it('counts nothing for body weight exercises while no body weight is logged', async () => {
    const db = await database('');
    expect(db.volumes()).toEqual([0, 500]);
  });

  it('counts the weight logged before each workout; older workouts take the first one', async () => {
    const db = await database(`
      INSERT INTO body_weights (id, logged_at, weight_kg) VALUES ('x', '2026-10-15T08:00:00Z', 80), ('y', '2026-11-01T08:00:00Z', 82);
    `);
    // w1 (before any weight): 80 × 10 pull-ups; the machine dip stays 0. w2: 82 × 8 + 100 × 5.
    expect(db.volumes()).toEqual([800, 82 * 8 + 500]);
    expect(db.setWeights()).toEqual([80, null, 82, null]);
  });
});
