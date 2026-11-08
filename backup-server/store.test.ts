import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createStore } from './store';
import type { Manifest } from '../shared/sync-types';

const GOOD: Manifest = {
  deviceId: 'phone-a',
  date: '2026-10-24T16:42:00.000Z',
  workouts: 312,
  files: [{ path: 'hevier.db', size: 4 }],
};

let dir: string;

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-store-'));
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(dir, { recursive: true, force: true });
});

function writeCopy(name: string, manifest: Manifest, body: string): void {
  fs.mkdirSync(path.join(dir, name), { recursive: true });
  fs.writeFileSync(path.join(dir, name, 'hevier.db'), body);
  fs.writeFileSync(path.join(dir, name, 'manifest.json'), JSON.stringify(manifest));
}

describe('store commit durability', () => {
  it('restores the previous copy when a swap was interrupted before current/ came back', () => {
    writeCopy('old', GOOD, 'good');

    const store = createStore(dir);

    expect(store.current()).toEqual(GOOD);
    expect(fs.readFileSync(path.join(dir, 'current', 'hevier.db'), 'utf8')).toBe('good');
  });

  it('replaces a half-written current/ with the previous copy', () => {
    writeCopy('old', GOOD, 'good');
    fs.mkdirSync(path.join(dir, 'current'));
    fs.writeFileSync(path.join(dir, 'current', 'stray.tmp'), 'half');

    const store = createStore(dir);

    expect(store.current()).toEqual(GOOD);
    expect(fs.existsSync(path.join(dir, 'current', 'stray.tmp'))).toBe(false);
  });

  it('still refuses a phone with fewer workouts after a swap failed while running', () => {
    writeCopy('current', GOOD, 'good');
    const store = createStore(dir);
    fs.renameSync(path.join(dir, 'current'), path.join(dir, 'old'));

    const answer = store.begin({ ...GOOD, workouts: 3 });

    expect(answer).toMatchObject({ reason: 'fewer' });
  });

  it('commits even when the old copy cannot be removed afterwards', () => {
    writeCopy('current', GOOD, 'good');
    const store = createStore(dir);
    const next: Manifest = { ...GOOD, workouts: 313, files: [{ path: 'hevier.db', size: 3 }] };
    store.begin({ ...next });
    fs.writeFileSync(path.join(dir, 'incoming', 'hevier.db'), 'new');
    const rm = fs.rmSync;
    let oldRemovals = 0;
    vi.spyOn(fs, 'rmSync').mockImplementation((target, options) => {
      if (String(target).endsWith('old') && ++oldRemovals === 2) throw new Error('EBUSY');
      rm(target, options);
    });

    expect(store.commit()).toEqual(next);

    expect(store.current()).toEqual(next);
    expect(() => store.commit()).toThrow('no sync started');
  });

  it('keeps the held copy when the final rename fails', () => {
    writeCopy('current', GOOD, 'good');
    const store = createStore(dir);
    const next: Manifest = { ...GOOD, workouts: 313, files: [{ path: 'hevier.db', size: 3 }] };
    store.begin({ ...next });
    fs.writeFileSync(path.join(dir, 'incoming', 'hevier.db'), 'new');
    const rename = fs.renameSync;
    vi.spyOn(fs, 'renameSync').mockImplementation((from, to) => {
      if (String(from).endsWith('incoming')) throw new Error('EPERM');
      rename(from, to);
    });

    expect(() => store.commit()).toThrow('EPERM');

    expect(store.current()).toEqual(GOOD);
    expect(fs.readFileSync(path.join(dir, 'current', 'hevier.db'), 'utf8')).toBe('good');
  });
});
