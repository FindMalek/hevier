import { Directory, File, Paths } from 'expo-file-system';

import type { FileEntry } from '@/shared/sync-types';
import { closeDb } from '@/db/client';
import { countWorkouts, lastWorkoutStart, makeSnapshot } from '@/db/sync/sync';
import { getDeviceId } from './deviceId';
import { STORAGE_FILES, STORAGE_FOLDERS, SYNC_FOLDERS } from '@/constants/storage';
import type { SyncIO } from '@/types/sync';

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

  // The database is closed first, its journal files removed, then the staged
  // copy and photos take the place of the old ones. The screen reloads the
  // app afterwards.
  async replaceAll(paths) {
    await closeDb();
    const sqlite = new Directory(Paths.document, STORAGE_FOLDERS.sqlite);
    sqlite.create({ intermediates: true, idempotent: true });
    const dbFile = STORAGE_FILES.database;
    for (const name of [dbFile, `${dbFile}-wal`, `${dbFile}-shm`, `${dbFile}-journal`]) {
      const f = new File(sqlite, name);
      if (f.exists) f.delete();
    }
    // Copied, not moved: a file moved out of the cache keeps Android's cache
    // marking.
    stagedFile(STORAGE_FILES.database).copy(new File(sqlite, STORAGE_FILES.database));
    for (const folder of SYNC_FOLDERS) {
      const dir = new Directory(Paths.document, folder);
      if (dir.exists) dir.delete();
      dir.create({ intermediates: true, idempotent: true });
    }
    for (const path of paths) {
      if (path !== STORAGE_FILES.database) stagedFile(path).copy(localFile(path));
    }
  },
};
