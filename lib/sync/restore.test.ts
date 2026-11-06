import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServer } from '@/backup-server/server';
import { createStore, type Store } from '@/backup-server/store';
import { KEY_HEADER } from '@/shared/sync-protocol';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: async () => null, setItem: async () => {} },
}));
const { fetchStatus } = await import('./client');
const { restoreFromPc } = await import('./restore');
type SyncIO = import('@/types/sync').SyncIO;
type Pairing = import('@/types/sync').Pairing;

let store: Store;
let pairing: Pairing;

beforeEach(async () => {
  store = createStore(fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-pc-')));
  const server = createServer(store);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  pairing = { host: '127.0.0.1', port: (server.address() as AddressInfo).port, key: store.key() };
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
});

// Puts a copy on the PC the way a phone would.
async function pcHolds(files: Record<string, string>, workouts = 312) {
  const headers = { [KEY_HEADER]: store.key(), 'content-type': 'application/json' };
  const base = `http://127.0.0.1:${pairing.port}`;
  const list = Object.entries(files).map(([p, b]) => ({ path: p, size: Buffer.byteLength(b) }));
  await fetch(`${base}/begin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ deviceId: 'phone-a', date: '2026-10-24T16:42:00.000Z', workouts, files: list }),
  });
  for (const [p, b] of Object.entries(files)) {
    await fetch(`${base}/file?path=${encodeURIComponent(p)}`, { method: 'PUT', headers, body: b });
  }
  await fetch(`${base}/commit`, { method: 'POST', headers });
}

// The new phone: downloads land in a staging folder; replaceAll records what
// would replace the phone's data.
function fakePhone(opts: { truncate?: string } = {}) {
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-staging-'));
  const replaced: string[][] = [];
  const io: SyncIO = {
    snapshot: async () => ({ deviceId: 'x', workouts: 0, files: [] }),
    upload: async () => 200,
    cleanup: async () => {},
    download: async (url, p, headers) => {
      const res = await fetch(url, { headers });
      let body = Buffer.from(await res.arrayBuffer());
      if (p === opts.truncate) body = body.subarray(0, 1);
      fs.mkdirSync(path.dirname(path.join(staging, p)), { recursive: true });
      fs.writeFileSync(path.join(staging, p), body);
      return { status: res.status, size: body.length };
    },
    replaceAll: async (paths) => void replaced.push(paths),
  };
  return { io, replaced, staged: (p: string) => fs.readFileSync(path.join(staging, p), 'utf8') };
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
  });

  it('a broken download leaves the phone untouched', async () => {
    await pcHolds({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a' });
    const phone = fakePhone({ truncate: 'media/a.jpg' });
    expect(await restoreFromPc(phone.io, pairing)).toMatchObject({ ok: false, reason: 'error' });
    expect(phone.replaced).toEqual([]);
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
