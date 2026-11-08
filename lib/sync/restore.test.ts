import fs from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServer } from '@/backup-server/server';
import { createStore, type Store } from '@/backup-server/store';
import { KEY_HEADER } from '@/shared/sync-protocol';

const stored = new Map<string, string>();
const storage = { failDeviceId: false };
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => stored.get(k) ?? null,
    setItem: async (k: string, v: string) => {
      if (storage.failDeviceId && k === 'hevier.sync.deviceId') throw new Error('disk full');
      stored.set(k, v);
    },
  },
}));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'new-id' }));
const { fetchStatus, quietSync, syncNow } = await import('./client');
const { getDeviceId } = await import('./deviceId');
const { isSyncBusy } = await import('./lock');
const { restoreFromPc } = await import('./restore');
const { KeptBackupError } = await import('./keptBackup');
type SyncIO = import('@/types/sync').SyncIO;
type Pairing = import('@/types/sync').Pairing;

let store: Store;
let pairing: Pairing;

beforeEach(async () => {
  store = createStore(fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-pc-')));
  const server = createServer(store);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  pairing = { host: '127.0.0.1', port: (server.address() as AddressInfo).port, key: store.key() };
  stored.clear();
  storage.failDeviceId = false;
  stored.set('hevier.sync.pairing', JSON.stringify(pairing));
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
});

// Puts a copy on the PC the way a phone would.
async function pcHolds(files: Record<string, string>, workouts = 312, lastWorkout?: string) {
  const headers = { [KEY_HEADER]: store.key(), 'content-type': 'application/json' };
  const base = `http://127.0.0.1:${pairing.port}`;
  const list = Object.entries(files).map(([p, b]) => ({ path: p, size: Buffer.byteLength(b) }));
  await fetch(`${base}/begin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ deviceId: 'phone-a', date: '2026-10-24T16:42:00.000Z', workouts, lastWorkout, files: list }),
  });
  for (const [p, b] of Object.entries(files)) {
    await fetch(`${base}/file?path=${encodeURIComponent(p)}`, { method: 'PUT', headers, body: b });
  }
  await fetch(`${base}/commit`, { method: 'POST', headers });
}

// The new phone: downloads land in a staging folder; replaceAll records what
// would replace the phone's data. `hold` pauses each download once it is on
// disk (`downloaded` says the first one is); `wipeOnCleanup` makes cleanup
// delete the staged files like the real one; `failReplace` is what the swap
// throws.
function fakePhone(opts: { truncate?: string; hold?: Promise<void>; wipeOnCleanup?: boolean; failReplace?: Error } = {}) {
  let firstDownloaded = () => {};
  const downloaded = new Promise<void>((resolve) => (firstDownloaded = resolve));
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-staging-'));
  const replaced: string[][] = [];
  const io: SyncIO = {
    snapshot: async () => ({ deviceId: 'x', workouts: 0, lastWorkout: null, files: [] }),
    upload: async () => 200,
    cleanup: async () => {
      if (opts.wipeOnCleanup) fs.rmSync(staging, { recursive: true, force: true });
    },
    download: async (url, p, headers) => {
      const res = await fetch(url, { headers });
      let body = Buffer.from(await res.arrayBuffer());
      if (p === opts.truncate) body = body.subarray(0, 1);
      fs.mkdirSync(path.dirname(path.join(staging, p)), { recursive: true });
      fs.writeFileSync(path.join(staging, p), body);
      firstDownloaded();
      await opts.hold;
      return { status: res.status, size: body.length };
    },
    replaceAll: async (paths) => {
      if (opts.failReplace) throw opts.failReplace;
      if (paths.some((p) => !fs.existsSync(path.join(staging, p)))) throw new Error('staged files are gone');
      replaced.push(paths);
    },
  };
  return { io, replaced, downloaded, staged: (p: string) => fs.readFileSync(path.join(staging, p), 'utf8') };
}

describe('fetchStatus', () => {
  it('no copy yet', async () => {
    expect(await fetchStatus(pairing)).toEqual({ backup: null });
  });

  it('the copy on the PC', async () => {
    await pcHolds({ 'hevier.db': 'db' });
    expect(await fetchStatus(pairing)).toMatchObject({ backup: { workouts: 312, deviceId: 'phone-a' } });
  });

  it('PC closed', async () => {
    expect(await fetchStatus({ ...pairing, port: 1 }, 1000)).toMatchObject({ ok: false, reason: 'pcNotFound' });
  });
});

describe('restoreFromPc', () => {
  it('downloads everything, then replaces the phone data', async () => {
    await pcHolds({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a', 'profile/me.jpg': 'me' });
    const phone = fakePhone();
    expect(await restoreFromPc(phone.io, pairing)).toEqual({ ok: true });
    expect(phone.staged('hevier.db')).toBe('db-1');
    expect(phone.staged('media/a.jpg')).toBe('photo-a');
    expect(phone.replaced).toEqual([['hevier.db', 'media/a.jpg', 'profile/me.jpg']]);
    // The restored phone carries on as the phone the copy came from.
    expect(stored.get('hevier.sync.deviceId')).toBe('phone-a');
  });

  it.each(['media/../hevier.db', 'media/sub/a.jpg', '/etc/passwd'])('a manifest naming %s is refused before anything is downloaded', async (bad) => {
    const server = http.createServer((_req, res) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ backup: { deviceId: 'phone-a', date: '2026-10-24T16:42:00.000Z', workouts: 1, files: [{ path: bad, size: 1 }] } }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const phone = fakePhone();
    let downloads = 0;
    const download = phone.io.download;
    phone.io.download = async (...args) => {
      downloads++;
      return download(...args);
    };
    const hostile = { ...pairing, port: (server.address() as AddressInfo).port };
    expect(await restoreFromPc(phone.io, hostile)).toMatchObject({ ok: false, reason: 'error' });
    await new Promise<void>((resolve) => server.close(() => resolve()));
    expect(downloads).toBe(0);
    expect(phone.replaced).toEqual([]);
  });

  it('a broken download leaves the phone untouched', async () => {
    await pcHolds({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a' });
    const phone = fakePhone({ truncate: 'media/a.jpg' });
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'error' });
    expect(phone.replaced).toEqual([]);
  });

  it('a restored phone syncs on as the phone the copy came from, not as older or another phone', async () => {
    await pcHolds({ 'hevier.db': 'db-1' }, 312, '2026-11-06T15:31:57.722Z');
    expect(await restoreFromPc(fakePhone().io, pairing)).toEqual({ ok: true });
    const phone = fakePhone();
    phone.io.snapshot = async () => ({
      deviceId: await getDeviceId(),
      workouts: 312,
      lastWorkout: '2026-11-06T15:31:57.722Z',
      files: [{ path: 'hevier.db', size: 4 }],
    });
    phone.io.upload = async (url, _p, headers) => (await fetch(url, { method: 'PUT', headers, body: 'db-2' })).status;
    expect(await syncNow(phone.io, { pairing })).toMatchObject({ ok: true });
  });

  it('a device id that cannot be kept does not fail a restore that went through', async () => {
    await pcHolds({ 'hevier.db': 'db-1' });
    storage.failDeviceId = true;
    const phone = fakePhone();
    expect(await restoreFromPc(phone.io, pairing)).toEqual({ ok: true });
    expect(phone.replaced).toEqual([['hevier.db']]);
  });

  it('a swap that fails is reported as an error', async () => {
    await pcHolds({ 'hevier.db': 'db-1' });
    const phone = fakePhone({ failReplace: new Error('disk full'), wipeOnCleanup: true });
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'error' });
    expect(() => phone.staged('hevier.db')).toThrow();
    // The phone's data is still its own, so it keeps its own id.
    expect(stored.get('hevier.sync.deviceId')).toBeUndefined();
  });

  it('a swap that could not put everything back says the data is kept', async () => {
    await pcHolds({ 'hevier.db': 'db-1' });
    const phone = fakePhone({ failReplace: new KeptBackupError(new Error('disk full')) });
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'restoreKept' });
  });

  it('the quiet sync on app open leaves a restore under way alone', async () => {
    await pcHolds({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a' });
    let release = () => {};
    const phone = fakePhone({ hold: new Promise<void>((r) => (release = r)), wipeOnCleanup: true });
    const restoring = restoreFromPc(phone.io, pairing);
    await phone.downloaded;
    expect(isSyncBusy()).toBe(true);
    await quietSync(phone.io);
    release();
    expect(await restoring).toEqual({ ok: true });
    expect(isSyncBusy()).toBe(false);
    expect(phone.replaced).toEqual([['hevier.db', 'media/a.jpg']]);
  });

  it('a restore waits for a sync under way', async () => {
    await pcHolds({ 'hevier.db': 'db-1' });
    const phone = fakePhone();
    const syncing = syncNow(phone.io, { pairing }); // takes the lock before its first await
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'busy' });
    await syncing;
  });

  it('no copy on the PC', async () => {
    const phone = fakePhone();
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'error' });
    expect(phone.replaced).toEqual([]);
  });

  it('PC closed', async () => {
    const phone = fakePhone();
    expect(await restoreFromPc(phone.io, { ...pairing, port: 1 })).toMatchObject({ ok: false, reason: 'pcNotFound' });
  });
});
