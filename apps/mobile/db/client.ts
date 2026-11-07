import * as SQLite from 'expo-sqlite';
import { invalidateHistory } from './historyCache';
import { runMigrations } from './migrations';
import { transactionsDone } from './transaction';
import { STORAGE_FILES } from '@/constants/storage';

// The opening itself is shared: callers that arrive while the database is
// still opening wait for the same connection instead of opening another one
// (a discarded second connection broke the first; see client.test.ts).
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(STORAGE_FILES.database);
      await runMigrations(db);
      return db;
    })();
    // A failed open shouldn't stick: the next call tries again.
    dbPromise.catch(() => {
      dbPromise = null;
    });
  }
  return dbPromise;
}

// Used by restore-from-backup: close the live connection before the
// underlying file is overwritten, then clear the cached instance so the
// next getDb() call reopens (and re-migrates) the replaced file. A transaction
// under way finishes first; the cached history is dropped (it is the old file's).
export async function closeDb(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    await transactionsDone();
    dbPromise = null;
    await db.closeAsync();
  }
  invalidateHistory();
}
