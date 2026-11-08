import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { checkAccept, filesToSend } from '../shared/sync-protocol';
import type { BeginRequest, BeginResponse, Manifest, Refusal } from '../shared/sync-types';

// The one copy on the PC:
//   key.txt     the secret the phone must send (made on first run)
//   current/    the copy: hevier.db, media/, profile/, manifest.json
//   incoming/   a copy being received; swapped in only when complete
//   old/        the previous copy, only while a swap is in progress
export type Store = ReturnType<typeof createStore>;

export class StoreError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export function createStore(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
  const keyFile = path.join(dir, 'key.txt');
  if (!fs.existsSync(keyFile)) fs.writeFileSync(keyFile, crypto.randomBytes(16).toString('hex') + '\n', { mode: 0o600 });
  const key = fs.readFileSync(keyFile, 'utf8').trim();

  const currentDir = path.join(dir, 'current');
  const incomingDir = path.join(dir, 'incoming');
  const oldDir = path.join(dir, 'old');
  let pending: BeginRequest | null = null;

  // A swap interrupted after current/ moved to old/ leaves no current/:
  // put the last good copy back.
  function restoreOld(): void {
    if (fs.existsSync(path.join(currentDir, 'manifest.json')) || !fs.existsSync(oldDir)) return;
    fs.rmSync(currentDir, { recursive: true, force: true });
    fs.renameSync(oldDir, currentDir);
  }

  restoreOld();

  function current(): Manifest | null {
    try {
      return JSON.parse(fs.readFileSync(path.join(currentDir, 'manifest.json'), 'utf8'));
    } catch {
      return null;
    }
  }

  function begin(req: BeginRequest): BeginResponse | Refusal {
    restoreOld();
    const held = current();
    const reason = checkAccept(held, req);
    if (reason) return { reason, pc: { workouts: held!.workouts, date: held!.date } };
    fs.rmSync(incomingDir, { recursive: true, force: true });
    fs.mkdirSync(incomingDir, { recursive: true });
    pending = { deviceId: req.deviceId, date: req.date, workouts: req.workouts, files: req.files };
    return { need: filesToSend(req.files, held?.files ?? []) };
  }

  function incomingPath(p: string): string {
    if (!pending) throw new StoreError(409, 'no sync started');
    return path.join(incomingDir, p);
  }

  function writeStream(p: string): fs.WriteStream {
    const file = incomingPath(p);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return fs.createWriteStream(file);
  }

  // Files the phone didn't resend are taken from the old copy, then the
  // finished copy replaces the old one.
  function commit(): Manifest {
    if (!pending) throw new StoreError(409, 'no sync started');
    const manifest = pending;
    for (const f of manifest.files) {
      const target = path.join(incomingDir, f.path);
      if (!fs.existsSync(target)) {
        const old = path.join(currentDir, f.path);
        if (fs.existsSync(old)) {
          fs.mkdirSync(path.dirname(target), { recursive: true });
          try {
            fs.linkSync(old, target);
          } catch {
            fs.copyFileSync(old, target);
          }
        }
      }
      if (!fs.existsSync(target) || fs.statSync(target).size !== f.size) {
        throw new StoreError(400, `missing or incomplete: ${f.path}`);
      }
    }
    fs.writeFileSync(path.join(incomingDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    restoreOld();
    fs.rmSync(oldDir, { recursive: true, force: true });
    if (fs.existsSync(currentDir)) fs.renameSync(currentDir, oldDir);
    try {
      fs.renameSync(incomingDir, currentDir);
    } catch (error) {
      restoreOld();
      throw error;
    }
    pending = null;
    try {
      fs.rmSync(oldDir, { recursive: true, force: true });
    } catch {
      // The new copy is live; the next commit removes it.
    }
    return manifest;
  }

  function readPath(p: string): string | null {
    const held = current();
    if (!held?.files.some((f) => f.path === p)) return null;
    return path.join(currentDir, p);
  }

  return { key: () => key, current, begin, writeStream, commit, readPath };
}
