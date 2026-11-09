import { beforeEach, describe, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { createServer } from './server';
import { createStore, type Store } from './store';
import { KEY_HEADER } from '@hevier/shared/sync-protocol';
import type { BeginRequest, Manifest } from '@hevier/shared/sync-types';

let dir: string;
let store: Store;
let server: ReturnType<typeof createServer>;
let base: string;

beforeEach(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-sync-'));
  store = createStore(dir);
  server = createServer(store);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return () => new Promise<void>((resolve) => server.close(() => resolve()));
});

const auth = () => ({ [KEY_HEADER]: store.key() });

async function begin(req: BeginRequest) {
  const res = await fetch(`${base}/begin`, {
    method: 'POST',
    headers: { ...auth(), 'content-type': 'application/json' },
    body: JSON.stringify(req),
  });
  return { status: res.status, body: await res.json() };
}

const put = (p: string, body: string) =>
  fetch(`${base}/file?path=${encodeURIComponent(p)}`, { method: 'PUT', headers: auth(), body });

const commit = () => fetch(`${base}/commit`, { method: 'POST', headers: auth() });

async function getFile(p: string) {
  const res = await fetch(`${base}/file?path=${encodeURIComponent(p)}`, { headers: auth() });
  return res.status === 200 ? await res.text() : res.status;
}

async function status(): Promise<Manifest | null> {
  const res = await fetch(`${base}/status`, { headers: auth() });
  return (await res.json()).backup;
}

// The phone's whole sync: begin, send what the PC asks for, commit.
async function sync(files: Record<string, string>, over: Partial<BeginRequest> = {}) {
  const req: BeginRequest = {
    deviceId: 'phone-a',
    date: '2026-10-24T16:42:00.000Z',
    workouts: 312,
    files: Object.entries(files).map(([p, body]) => ({ path: p, size: Buffer.byteLength(body) })),
    ...over,
  };
  const b = await begin(req);
  if (b.status !== 200) return { ...b, need: [] as string[] };
  for (const p of b.body.need) await put(p, files[p]);
  const c = await commit();
  return { status: c.status, body: await c.json(), need: b.body.need };
}

describe('backup server', () => {
  it('refuses every route without the key', async () => {
    const routes: [string, string][] = [
      ['GET', '/status'],
      ['POST', '/begin'],
      ['PUT', '/file?path=hevier.db'],
      ['POST', '/commit'],
      ['GET', '/file?path=hevier.db'],
    ];
    for (const [method, route] of routes) {
      const res = await fetch(`${base}${route}`, { method, headers: { [KEY_HEADER]: 'wrong' } });
      expect(res.status, `${method} ${route}`).toBe(401);
    }
  });

  it('keeps the first copy and serves it back', async () => {
    expect(await status()).toBeNull();
    const r = await sync({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a', 'profile/me.jpg': 'me' });
    expect(r.status).toBe(200);
    expect((await status())?.workouts).toBe(312);
    expect(await getFile('hevier.db')).toBe('db-1');
    expect(await getFile('media/a.jpg')).toBe('photo-a');
    expect(await getFile('profile/me.jpg')).toBe('me');
  });

  it('second sync sends only the database and new photos; dropped photos go', async () => {
    await sync({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a', 'media/old.jpg': 'old' });
    const r = await sync({ 'hevier.db': 'db-2', 'media/a.jpg': 'photo-a', 'media/new.jpg': 'new' });
    expect(r.need).toEqual(['hevier.db', 'media/new.jpg']);
    expect(await getFile('hevier.db')).toBe('db-2');
    expect(await getFile('media/a.jpg')).toBe('photo-a');
    expect(await getFile('media/new.jpg')).toBe('new');
    expect(await getFile('media/old.jpg')).toBe(404);
  });

  it('a sync cut halfway leaves the old copy; the next one starts clean', async () => {
    await sync({ 'hevier.db': 'db-1', 'media/a.jpg': 'photo-a' });
    const files = [
      { path: 'hevier.db', size: 4 },
      { path: 'media/b.jpg', size: 7 },
    ];
    await begin({ deviceId: 'phone-a', date: '2026-10-25T10:00:00.000Z', workouts: 313, files });
    await put('hevier.db', 'db-2');
    // no commit: the app was closed
    expect((await status())?.workouts).toBe(312);
    expect(await getFile('hevier.db')).toBe('db-1');

    const r = await sync({ 'hevier.db': 'db-3', 'media/b.jpg': 'photo-b' }, { workouts: 313 });
    expect(r.status).toBe(200);
    expect(await getFile('hevier.db')).toBe('db-3');
    expect(await getFile('media/b.jpg')).toBe('photo-b');
    expect(await getFile('media/a.jpg')).toBe(404);
  });

  it('commit with a file missing fails and keeps the old copy', async () => {
    await sync({ 'hevier.db': 'db-1' });
    await begin({
      deviceId: 'phone-a',
      date: '2026-10-25T10:00:00.000Z',
      workouts: 313,
      files: [
        { path: 'hevier.db', size: 4 },
        { path: 'media/b.jpg', size: 7 },
      ],
    });
    await put('hevier.db', 'db-2');
    expect((await commit()).status).toBe(400);
    expect(await getFile('hevier.db')).toBe('db-1');
  });

  it('refuses paths outside the copy', async () => {
    await begin({ deviceId: 'phone-a', date: '2026-10-25T10:00:00.000Z', workouts: 1, files: [] });
    for (const p of ['../evil', 'media/../key.txt', '../../.bashrc']) {
      const res = await put(p, 'x');
      expect(res.status, p).toBe(400);
      expect((await fetch(`${base}/file?path=${encodeURIComponent(p)}`, { headers: auth() })).status).toBe(400);
    }
    expect(fs.existsSync(path.join(dir, '..', 'evil'))).toBe(false);
    expect(fs.readFileSync(path.join(dir, 'key.txt'), 'utf8').trim()).toBe(store.key());
  });

  it('PUT and commit without a begin are refused', async () => {
    expect((await put('hevier.db', 'x')).status).toBe(409);
    expect((await commit()).status).toBe(409);
  });

  it('refuses fewer workouts or another phone, unless forced', async () => {
    await sync({ 'hevier.db': 'db-1' });
    const fewer = await sync({ 'hevier.db': 'db-2' }, { workouts: 12 });
    expect(fewer).toEqual({ status: 409, need: [], body: { reason: 'fewer', pc: { workouts: 312, date: '2026-10-24T16:42:00.000Z' } } });
    const other = await sync({ 'hevier.db': 'db-2' }, { deviceId: 'emulator' });
    expect(other.status).toBe(409);
    expect(other.body.reason).toBe('otherDevice');

    expect((await sync({ 'hevier.db': 'db-2' }, { workouts: 12, force: true })).status).toBe(200);
    expect((await status())?.workouts).toBe(12);
    expect((await sync({ 'hevier.db': 'db-3' }, { deviceId: 'emulator', force: true })).status).toBe(200);
    expect((await status())?.deviceId).toBe('emulator');
  });

  it('keeps the key across restarts', () => {
    expect(store.key()).toMatch(/^[0-9a-f]{32}$/);
    expect(createStore(dir).key()).toBe(store.key());
  });
});
