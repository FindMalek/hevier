import fs from 'node:fs';
import type { AddressInfo } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createServer } from '@/backup-server/server';
import { createStore, type Store } from '@/backup-server/store';

const stored = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => stored.get(k) ?? null,
    setItem: async (k: string, v: string) => void stored.set(k, v),
  },
}));
const { getLastRefusal, onRefusalChange, quietSync, syncNow } = await import('./client');
const { getLastSynced } = await import('./pairing');
const { isSyncBusy } = await import('./lock');
type SyncIO = import('@/types/sync').SyncIO;
type Pairing = import('@/types/sync').Pairing;

let store: Store;
let pairing: Pairing;

beforeEach(async () => {
  stored.clear();
  store = createStore(fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-pc-')));
  const server = createServer(store);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  pairing = { host: '127.0.0.1', port: (server.address() as AddressInfo).port, key: store.key() };
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
});

// The phone's files in a temp folder; uploads go through real HTTP.
function fakePhone(files: Record<string, string>, deviceId = 'phone-a', workouts = 312) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-phone-'));
  for (const [p, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, p)), { recursive: true });
    fs.writeFileSync(path.join(dir, p), body);
  }
  const uploads: string[] = [];
  let cleanups = 0;
  const io: SyncIO = {
    snapshot: async () => ({
      deviceId,
      workouts,
      lastWorkout: null,
      files: Object.keys(files).map((p) => ({ path: p, size: fs.statSync(path.join(dir, p)).size })),
    }),
    upload: async (url, p, headers) => {
      uploads.push(p);
      const res = await fetch(url, { method: 'PUT', headers, body: fs.readFileSync(path.join(dir, p)) });
      return res.status;
    },
    cleanup: async () => void cleanups++,
    download: async () => ({ status: 500, size: 0 }),
    replaceAll: async () => {},
  };
  return { io, uploads, cleanups: () => cleanups };
}

describe('syncNow', () => {
  it('not paired', async () => {
    expect(await syncNow(fakePhone({}).io, { pairing: null })).toEqual({ ok: false, reason: 'notPaired' });
  });

  it('PC program closed → pcNotFound within the timeout', async () => {
    const started = Date.now();
    const result = await syncNow(fakePhone({ 'hevier.db': 'db' }).io, { pairing: { ...pairing, port: 1 }, timeoutMs: 1000 });
    expect(result).toMatchObject({ ok: false, reason: 'pcNotFound' });
    expect(Date.now() - started).toBeLessThan(1500);
  });

  it('wrong key', async () => {
    const result = await syncNow(fakePhone({ 'hevier.db': 'db' }).io, { pairing: { ...pairing, key: 'f'.repeat(32) } });
    expect(result).toMatchObject({ ok: false, reason: 'wrongKey' });
  });

  it('first sync sends everything; the next only the database and new photos', async () => {
    const first = fakePhone({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a', 'profile/me.jpg': 'me' });
    const r1 = await syncNow(first.io, { pairing });
    expect(r1.ok).toBe(true);
    expect(first.uploads.sort()).toEqual(['hevier.db', 'media/a.jpg', 'profile/me.jpg']);
    expect(store.current()?.files).toHaveLength(3);
    expect(await getLastSynced()).toBe(r1.ok && r1.at);
    expect(first.cleanups()).toBe(1);

    const second = fakePhone({ 'hevier.db': 'db-2', 'media/a.jpg': 'photo-a', 'media/b.jpg': 'b', 'profile/me.jpg': 'me' });
    expect((await syncNow(second.io, { pairing })).ok).toBe(true);
    expect(second.uploads.sort()).toEqual(['hevier.db', 'media/b.jpg']);
  });

  it('fewer workouts is refused; Send anyway goes through', async () => {
    await syncNow(fakePhone({ 'hevier.db': 'db-1' }).io, { pairing });
    const phone = fakePhone({ 'hevier.db': 'db-2' }, 'phone-a', 12);
    const refused = await syncNow(phone.io, { pairing });
    expect(refused).toMatchObject({ ok: false, reason: 'fewer', pc: { workouts: 312 }, phoneWorkouts: 12 });
    expect(phone.uploads).toEqual([]);
    expect(phone.cleanups()).toBe(1);
    expect((await syncNow(phone.io, { pairing, force: true })).ok).toBe(true);
    expect(store.current()?.workouts).toBe(12);
  });

  it('another phone is refused; Replace goes through', async () => {
    await syncNow(fakePhone({ 'hevier.db': 'db-1' }).io, { pairing });
    const other = fakePhone({ 'hevier.db': 'db-x' }, 'emulator', 400);
    expect(await syncNow(other.io, { pairing })).toMatchObject({ ok: false, reason: 'otherDevice' });
    expect((await syncNow(other.io, { pairing, force: true })).ok).toBe(true);
    expect(store.current()?.deviceId).toBe('emulator');
  });
});

describe('a transfer that stops moving', () => {
  it('answers timeout, frees the lock and cleans up; the next sync works', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const stuck = fakePhone({ 'hevier.db': 'db-1' });
    stuck.io.upload = () => new Promise<number>(() => {}); // a dropped Wi-Fi: never answers, ignores the abort
    expect(await syncNow(stuck.io, { pairing, stallMs: 50 })).toEqual({ ok: false, reason: 'timeout' });
    expect(isSyncBusy()).toBe(false);
    expect(stuck.cleanups()).toBeGreaterThan(0);
    expect(await syncNow(fakePhone({ 'hevier.db': 'db-1' }).io, { pairing })).toMatchObject({ ok: true });
  });

  it('is not cut off while bytes keep moving, however long the whole upload takes', async () => {
    const slow = fakePhone({ 'hevier.db': 'db-1' });
    const upload = slow.io.upload;
    slow.io.upload = async (url, p, headers, hooks) => {
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 25));
        hooks?.onProgress();
      }
      return upload(url, p, headers, hooks);
    };
    expect(await syncNow(slow.io, { pairing, stallMs: 80 })).toMatchObject({ ok: true });
  });
});

describe('quietSync', () => {
  it('gives up quickly and silently when the PC program is closed', async () => {
    stored.set('hevier.sync.pairing', JSON.stringify({ ...pairing, port: 1 }));
    const started = Date.now();
    await expect(quietSync(fakePhone({ 'hevier.db': 'db' }).io)).resolves.toBeUndefined();
    expect(Date.now() - started).toBeLessThan(2500);
  });

  it('never forces, and keeps the refusal for the Sync screen', async () => {
    await syncNow(fakePhone({ 'hevier.db': 'db-1' }).io, { pairing });
    stored.set('hevier.sync.pairing', JSON.stringify(pairing));
    await quietSync(fakePhone({ 'hevier.db': 'db-2' }, 'phone-a', 12).io);
    expect(getLastRefusal()).toMatchObject({ reason: 'fewer' });
    expect(store.current()?.workouts).toBe(312);

    await quietSync(fakePhone({ 'hevier.db': 'db-3' }, 'phone-a', 313).io);
    expect(getLastRefusal()).toBeNull();
  });

  it('tells an open Sync screen when the refusal changes', async () => {
    await syncNow(fakePhone({ 'hevier.db': 'db-1' }).io, { pairing });
    stored.set('hevier.sync.pairing', JSON.stringify(pairing));
    const seen: (string | undefined)[] = [];
    const stop = onRefusalChange((r) => seen.push(r?.reason));
    await quietSync(fakePhone({ 'hevier.db': 'db-2' }, 'phone-a', 12).io);
    await quietSync(fakePhone({ 'hevier.db': 'db-3' }, 'phone-a', 313).io);
    stop();
    await quietSync(fakePhone({ 'hevier.db': 'db-4' }, 'phone-a', 1).io);
    expect(seen).toEqual(['fewer', undefined]);
  });
});
