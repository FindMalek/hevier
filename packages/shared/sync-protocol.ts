// What the phone and the PC program (apps/sync/) say to each other. Both
// import it (the app from lib/sync), so keep it free of Node imports.
// Its types are in sync-types.ts.

import type { BeginRequest, FileEntry, Manifest, Refusal } from './sync-types';

export const KEY_HEADER = 'x-hevier-key';
export const DEFAULT_PORT = 4873;

// The database, or one file straight inside media/ or profile/. Nothing else
// can be written or read, so a path can't reach outside the copy.
export function isValidPath(p: string): boolean {
  return /^(hevier\.db|(media|profile)\/[A-Za-z0-9._-]+)$/.test(p) && !p.split('/').includes('.') && !p.includes('..');
}

// The PC keeps the newest data. Another phone's copy is never replaced
// without asking, and neither is a copy with more workouts (a wiped phone
// mustn't erase the good copy) or with a newer last workout (an old copy of
// the data, e.g. a database copied onto another device, mustn't replace newer).
export function checkAccept(current: Manifest | null, incoming: BeginRequest): Refusal['reason'] | null {
  if (!current || incoming.force) return null;
  if (incoming.deviceId !== current.deviceId) return 'otherDevice';
  if (incoming.workouts < current.workouts) return 'fewer';
  if (incoming.lastWorkout && current.lastWorkout && incoming.lastWorkout < current.lastWorkout) return 'older';
  return null;
}

// Photos never change once saved, so the PC only needs the ones it lacks.
// The database changes every time.
export function filesToSend(incoming: FileEntry[], current: FileEntry[]): string[] {
  const held = new Map(current.map((f) => [f.path, f.size]));
  return incoming.filter((f) => f.path === 'hevier.db' || held.get(f.path) !== f.size).map((f) => f.path);
}
