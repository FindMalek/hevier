import * as SQLite from 'expo-sqlite';
import { invalidateHistory } from './historyCache';
import { runMigrations } from './migrations';
import { transactionsDone } from './transaction';
import { STORAGE_FILES } from '@/constants/storage';

// The opening itself is shared: callers that arrive while the database is
// still opening wait for the same connection instead of opening another one
// (a discarded second connection broke the first; see client.test.ts).
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// While a restore swaps the database files, getDb() waits here: a connection
// opened on files being moved would write to the old ones or open half a copy.
let swapGate: Promise<void> | null = null;

// Run before every open of the database file (lib/sync/expoIO.ts puts an
// interrupted restore back there). While one says false the old data is still
// waiting, and opening would create an empty database on top of it. A list,
// so a second task can never replace the restore's; the function returned
// takes the task out again.
const beforeOpenTasks: (() => Promise<boolean>)[] = [];

export function addBeforeOpen(task: () => Promise<boolean>): () => void {
  beforeOpenTasks.push(task);
  return () => {
    const at = beforeOpenTasks.indexOf(task);
    if (at >= 0) beforeOpenTasks.splice(at, 1);
  };
}

async function beforeOpenAllowed(): Promise<boolean> {
  for (const task of beforeOpenTasks) {
    if (!(await task())) return false;
  }
  return true;
}

// What getDb() rejects with while an interrupted restore's data is still waiting.
export class DataWaitingError extends Error {
  constructor() {
    super('Your data is waiting to be put back from an interrupted restore. Tap Try again. If it still does not open, close Hevier and open it again.');
    this.name = 'DataWaitingError';
  }
}

export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (swapGate) return swapGate.then(getDb);
  if (!dbPromise) {
    dbPromise = (async () => {
      if (!(await beforeOpenAllowed())) throw new DataWaitingError();
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

function holdGate(): () => void {
  let open = () => {};
  swapGate = new Promise<void>((resolve) => {
    open = () => {
      swapGate = null;
      resolve();
    };
  });
  return open;
}

// Used by restore-from-backup: close the live connection before the
// underlying file is overwritten, then clear the cached instance so the
// next getDb() call reopens (and re-migrates) the replaced file. A transaction
// under way finishes first; the cached history is dropped (it is the old file's).
// From here getDb() waits until the returned function is called.
export async function closeDbAndHold(): Promise<() => void> {
  const db = dbPromise ? await dbPromise : null;
  if (db) await transactionsDone();
  const release = holdGate();
  dbPromise = null;
  try {
    await db?.closeAsync();
  } catch (e) {
    release();
    throw e;
  }
  invalidateHistory();
  return release;
}
