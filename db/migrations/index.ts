import { SELECT_USER_VERSION, setUserVersion } from './queries';
import type { UserVersionRow } from './rows';
import { sql as migration001 } from './001_init';
import { sql as migration002 } from './002_exercise_catalogue';
import { sql as migration003 } from './003_routine_folders';
import { sql as migration004 } from './004_routine_sets';
import { sql as migration005 } from './005_routine_notes';
import { sql as migration006 } from './006_football';
import { sql as migration007 } from './007_workout_media';
import { sql as migration008 } from './008_indexes';
import { sql as migration009 } from './009_warmup_sets';
import { sql as migration010 } from './010_iso_lateral_low_row';
import { sql as migration011 } from './011_body_weights';
import type { Migration, MigratableDb } from './types';

export const MIGRATIONS: Migration[] = [
  { version: 1, sql: migration001 },
  { version: 2, sql: migration002 },
  { version: 3, sql: migration003 },
  { version: 4, sql: migration004 },
  { version: 5, sql: migration005 },
  { version: 6, sql: migration006 },
  { version: 7, sql: migration007 },
  { version: 8, sql: migration008 },
  { version: 9, sql: migration009 },
  { version: 10, sql: migration010 },
  { version: 11, sql: migration011 },
];


export async function runMigrations(db: MigratableDb): Promise<void> {
  const row = await db.getFirstAsync<UserVersionRow>(SELECT_USER_VERSION);
  const currentVersion = row?.user_version ?? 0;
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await db.execAsync(migration.sql);
      await db.execAsync(setUserVersion(migration.version));
    }
  }
}
