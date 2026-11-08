import { Directory, File, Paths } from 'expo-file-system';

import type { FileEntry } from '@/shared/sync-types';
import { closeDbAndHold, runBeforeOpen } from '@/db/client';
import { MIGRATIONS } from '@/db/migrations';
import { countWorkouts, lastWorkoutStart, makeSnapshot } from '@/db/sync/sync';
import { getDeviceId } from './deviceId';
import { RESTORE_MARKERS, SQLITE_HEADER, STORAGE_FILES, STORAGE_FOLDERS, SYNC_FOLDERS } from '@/constants/storage';
import type { RestoreItem, SyncIO } from '@/types/sync';
import { isRestorableDatabase } from './dbHeader';
import { KeptBackupError } from './keptBackup';

// The phone's side of SyncIO: the database copy is made in the cache, the
// photos are sent straight from documents/media and documents/profile.
// A restore downloads into cache/restore first, then moves everything in.

function snapshotFile() {
  return new File(Paths.cache, STORAGE_FOLDERS.syncCache, STORAGE_FILES.database);
}

function stagedFile(path: string): File {
  return new File(Paths.cache, STORAGE_FOLDERS.restoreCache, ...path.split('/'));
}

function localFile(path: string): File {
  return path === STORAGE_FILES.database ? snapshotFile() : new File(Paths.document, ...path.split('/'));
}

function listFolder(folder: string): FileEntry[] {
  const dir = new Directory(Paths.document, folder);
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((item): item is File => item instanceof File)
    .map((f) => ({ path: `${folder}/${f.name}`, size: f.size }));
}

function sqliteDir(): Directory {
  return new Directory(Paths.document, STORAGE_FOLDERS.sqlite);
}

function backupDir(): Directory {
  return new Directory(Paths.document, STORAGE_FOLDERS.restoreBackup);
}

function trashDir(): Directory {
  return new Directory(Paths.document, STORAGE_FOLDERS.restoreTrash);
}

function restoreItems(): RestoreItem[] {
  const dbFile = STORAGE_FILES.database;
  return [
    ...[dbFile, `${dbFile}-wal`, `${dbFile}-shm`, `${dbFile}-journal`].map((name) => ({ name, folder: false })),
    ...SYNC_FOLDERS.map((name) => ({ name, folder: true })),
  ];
}

function liveOf(item: RestoreItem): File | Directory {
  return item.folder ? new Directory(Paths.document, item.name) : new File(sqliteDir(), item.name);
}

function keptOf(item: RestoreItem, backup: Directory): File | Directory {
  return item.folder ? new Directory(backup, item.name) : new File(backup, item.name);
}

function verifyStaged(paths: string[]): void {
  for (const path of paths) {
    if (!stagedFile(path).exists) throw new Error(`restore: ${path} was not downloaded`);
  }
  const handle = stagedFile(STORAGE_FILES.database).open();
  try {
    if (!isRestorableDatabase(handle.readBytes(SQLITE_HEADER.length), MIGRATIONS[MIGRATIONS.length - 1].version)) {
      throw new Error('restore: the backup is not a Hevier database');
    }
  } finally {
    handle.close();
  }
}

function setAside(backup: Directory): void {
  for (const item of restoreItems()) {
    const live = liveOf(item);
    if (live.exists) live.moveSync(item.folder ? backup : keptOf(item, backup));
  }
}

// Copied, not moved: a file moved out of the cache keeps Android's cache
// marking. The synchronous copy throws here, not after the restore is "done".
function moveIn(paths: string[]): void {
  sqliteDir().create({ intermediates: true, idempotent: true });
  stagedFile(STORAGE_FILES.database).copySync(new File(sqliteDir(), STORAGE_FILES.database));
  for (const folder of SYNC_FOLDERS) {
    new Directory(Paths.document, folder).create({ intermediates: true, idempotent: true });
  }
  for (const path of paths) {
    if (path !== STORAGE_FILES.database) stagedFile(path).copySync(localFile(path));
  }
}

// The trash only holds a backup that was already judged (committed, or put
// back), so leaving it is harmless: a delete that fails must never be what
// blocks the app from starting or turns a finished restore into a failed one.
function dropTrash(): void {
  try {
    if (trashDir().exists) trashDir().delete();
  } catch (e) {
    console.warn('[sync] could not delete restore-trash', e);
  }
}

// One rename takes the markers away together with the folder: a delete cut
// short must not leave a backup whose markers are half gone.
// (A moved Directory object points at its new place, so this makes its own.)
function discardBackup(): boolean {
  try {
    const backup = backupDir();
    if (backup.exists) backup.moveSync(trashDir());
  } catch (e) {
    console.warn('[sync] could not delete restore-backup', e);
    return false;
  }
  dropTrash();
  return true;
}

// Puts the old data back from restore-backup, going by what is in it: only an
// item the backup holds replaces the live one, so nothing is deleted unless
// its original is there to take its place. An item put back is noted (`.back`),
// so a second try after a failure doesn't take it for new data. A finished
// restore (committed) just drops the backup. The backup is deleted only when
// everything is back.
function recoverBackup(): boolean {
  const backup = backupDir();
  if (!backup.exists) return true;
  if (new File(backup, RESTORE_MARKERS.committed).exists) return discardBackup();
  const newDataStarted = new File(backup, RESTORE_MARKERS.setAside).exists;
  let ok = true;
  try {
    sqliteDir().create({ intermediates: true, idempotent: true });
  } catch (e) {
    console.warn('[sync] put back failed', e);
    ok = false;
  }
  for (const item of restoreItems()) {
    try {
      const kept = keptOf(item, backup);
      const live = liveOf(item);
      const back = new File(backup, `${item.name}.back`);
      if (kept.exists) {
        if (!back.exists) back.create();
        if (live.exists) live.delete();
        kept.moveSync(live);
      } else if (newDataStarted && !back.exists && live.exists) {
        live.delete();
      }
    } catch (e) {
      console.warn('[sync] put back failed', item.name, e);
      ok = false;
    }
  }
  return ok && discardBackup();
}

// A restore the app was killed in the middle of is put right before the
// database is opened; false means the old data is still waiting in restore-backup.
export function recoverInterruptedRestore(): boolean {
  try {
    dropTrash(); // already judged: only its delete was left
    return recoverBackup();
  } catch (e) {
    console.warn('[sync] restore recovery failed', e);
    return false;
  }
}

runBeforeOpen(async () => recoverInterruptedRestore());

export const expoIO: SyncIO = {
  async snapshot() {
    const dest = snapshotFile();
    new Directory(Paths.cache, STORAGE_FOLDERS.syncCache).create({ intermediates: true, idempotent: true });
    if (dest.exists) dest.delete();
    await makeSnapshot(decodeURI(dest.uri.replace(/^file:\/\//, '')));
    const files = [{ path: STORAGE_FILES.database, size: snapshotFile().size }, ...SYNC_FOLDERS.flatMap(listFolder)];
    return { deviceId: await getDeviceId(), workouts: await countWorkouts(), lastWorkout: await lastWorkoutStart(), files };
  },

  async upload(url, path, headers) {
    try {
      const result = await localFile(path).upload(url, { httpMethod: 'PUT', headers });
      return result.status;
    } catch (e) {
      console.warn('[sync] upload failed', path, e);
      return 0;
    }
  },

  async cleanup() {
    const dest = snapshotFile();
    if (dest.exists) dest.delete();
    const staging = new Directory(Paths.cache, STORAGE_FOLDERS.restoreCache);
    if (staging.exists) staging.delete();
  },

  async download(url, path, headers) {
    const dest = stagedFile(path);
    dest.parentDirectory.create({ intermediates: true, idempotent: true });
    // Rejects on anything but a 2xx answer.
    const file = await File.downloadFileAsync(url, dest, { headers, idempotent: true });
    return { status: 200, size: file.size };
  },

  // Checked before anything is touched: every file arrived and the database is
  // one this app can open. Then the database is closed (and stays out of reach
  // of the rest of the app), the phone's own data is set aside in
  // restore-backup and the staged copy moves in. If that fails, the old data
  // is put back; if that fails too, the backup is kept and the next app start
  // tries again. The screen reloads the app afterwards.
  async replaceAll(paths) {
    verifyStaged(paths);
    const release = await closeDbAndHold();
    try {
      const backup = backupDir();
      if (!recoverBackup()) throw new KeptBackupError(new Error('an earlier restore-backup is still there'));
      backup.create({ intermediates: true });
      try {
        setAside(backup);
        new File(backup, RESTORE_MARKERS.setAside).create();
        moveIn(paths);
        new File(backup, RESTORE_MARKERS.committed).create();
      } catch (e) {
        if (!recoverBackup()) throw new KeptBackupError(e);
        throw e;
      }
      discardBackup();
    } finally {
      release();
    }
  },
};
