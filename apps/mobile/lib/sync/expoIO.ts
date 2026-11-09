import { Directory, File, Paths } from 'expo-file-system';

import type { FileEntry } from '@hevier/shared/sync-types';
import { addBeforeOpen, closeDbAndHold } from '@/db/client';
import { MIGRATIONS } from '@/db/migrations';
import { countWorkouts, lastWorkoutStart, makeSnapshot } from '@/db/sync/sync';
import { getDeviceId } from './deviceId';
import { RESTORE_MARKERS, SQLITE_HEADER, STORAGE_FILES, STORAGE_FOLDERS, SYNC_FOLDERS } from '@/constants/storage';
import type { RestoreItem, SyncIO } from '@/types/sync';
import { isRestorableDatabase } from './dbHeader';
import { KeptBackupError } from './keptBackup';
import { noteUnfinishedRestore } from './restoreNotice';

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

// What a restore replaces: the database with its side files, and the photo folders.
const RESTORE_ITEMS: RestoreItem[] = [
  ...[STORAGE_FILES.database, `${STORAGE_FILES.database}-wal`, `${STORAGE_FILES.database}-shm`, `${STORAGE_FILES.database}-journal`].map(
    (name) => ({ name, folder: false })
  ),
  ...SYNC_FOLDERS.map((name) => ({ name, folder: true })),
];

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
  for (const item of RESTORE_ITEMS) {
    const live = liveOf(item);
    if (live.exists) live.moveSync(item.folder ? backup : keptOf(item, backup));
  }
}

// Copied, not moved: a file moved out of the cache keeps Android's cache
// marking. One file at a time, each awaited: the swap is finished (or has
// thrown) before the gate is released. The async copy runs off the JS thread,
// so the screen keeps drawing; copySync would freeze it for as long as the
// whole library takes. The gate keeps the rest of the app out meanwhile, and a
// kill in the middle of a copy is what the crash test models.
async function moveIn(paths: string[]): Promise<void> {
  sqliteDir().create({ intermediates: true, idempotent: true });
  await stagedFile(STORAGE_FILES.database).copy(new File(sqliteDir(), STORAGE_FILES.database));
  for (const folder of SYNC_FOLDERS) {
    new Directory(Paths.document, folder).create({ intermediates: true, idempotent: true });
  }
  for (const path of paths) {
    if (path !== STORAGE_FILES.database) await stagedFile(path).copy(localFile(path));
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

// One item of the old data. When the backup holds it, it replaces the live
// one (noted with `.back` first, so a second try after a failure doesn't take
// it for new data). When it doesn't, the live one is new data that was half
// copied in, and goes, unless it was already put back.
function putBack(item: RestoreItem, backup: Directory, newDataStarted: boolean): boolean {
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
    return true;
  } catch (e) {
    console.warn('[sync] put back failed', item.name, e);
    return false;
  }
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
  for (const item of RESTORE_ITEMS) {
    if (!putBack(item, backup, newDataStarted)) ok = false;
  }
  return ok && discardBackup();
}

// A restore the app was killed in the middle of is put right before the
// database is opened; false means the old data is still waiting in restore-backup.
// One that was not committed is undone even when all its data had moved in, and
// the user is told once (see `undoneRestore`).
export function recoverInterruptedRestore(): boolean {
  try {
    dropTrash(); // already judged: only its delete was left
    const backup = backupDir();
    const unfinished = backup.exists && !new File(backup, RESTORE_MARKERS.committed).exists;
    const ok = recoverBackup();
    if (unfinished && ok) undoneRestore = true;
    return ok;
  } catch (e) {
    console.warn('[sync] restore recovery failed', e);
    return false;
  }
}

// Set when a start-up recovery undid a restore that never reached COMMITTED:
// the user would otherwise see their old data with no word why.
let undoneRestore = false;

addBeforeOpen(async () => {
  const ok = recoverInterruptedRestore();
  if (undoneRestore) {
    undoneRestore = false;
    await noteUnfinishedRestore().catch((e) => console.warn('[sync] could not note the undone restore', e));
  }
  return ok;
});

export const expoIO: SyncIO = {
  async snapshot() {
    const dest = snapshotFile();
    new Directory(Paths.cache, STORAGE_FOLDERS.syncCache).create({ intermediates: true, idempotent: true });
    if (dest.exists) dest.delete();
    await makeSnapshot(decodeURI(dest.uri.replace(/^file:\/\//, '')));
    const files = [{ path: STORAGE_FILES.database, size: snapshotFile().size }, ...SYNC_FOLDERS.flatMap(listFolder)];
    return { deviceId: await getDeviceId(), workouts: await countWorkouts(), lastWorkout: await lastWorkoutStart(), files };
  },

  async upload(url, path, headers, hooks) {
    try {
      const result = await localFile(path).upload(url, { httpMethod: 'PUT', headers, ...hooks });
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

  async download(url, path, headers, hooks) {
    const dest = stagedFile(path);
    dest.parentDirectory.create({ intermediates: true, idempotent: true });
    // Rejects on anything but a 2xx answer.
    const file = await File.downloadFileAsync(url, dest, { headers, idempotent: true, ...hooks });
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
        await moveIn(paths);
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
