import { describe, expect, it } from 'vitest';
import { checkAccept, filesToSend, isValidPath } from './sync-protocol';
import type { Manifest } from './sync-types';

const manifest = (over: Partial<Manifest> = {}): Manifest => ({
  deviceId: 'phone-a',
  date: '2026-10-24T16:42:00.000Z',
  workouts: 312,
  files: [],
  ...over,
});

describe('isValidPath', () => {
  it('accepts the database, media and profile files', () => {
    expect(isValidPath('hevier.db')).toBe(true);
    expect(isValidPath('media/ab-12.jpg')).toBe(true);
    expect(isValidPath('profile/x.jpg')).toBe(true);
  });

  it('rejects anything else', () => {
    for (const p of ['../x', 'media/../key.txt', 'catalogue/still/1.webp', 'media/', '/etc/passwd', 'media/a/b.jpg', 'media/..', 'media/.', 'profile/.', '']) {
      expect(isValidPath(p), p).toBe(false);
    }
  });
});

describe('checkAccept', () => {
  it('takes anything when the PC has no copy', () => {
    expect(checkAccept(null, manifest({ workouts: 0 }))).toBeNull();
  });

  it('refuses fewer workouts', () => {
    expect(checkAccept(manifest(), manifest({ workouts: 12 }))).toBe('fewer');
  });

  it('refuses another device, before the count', () => {
    expect(checkAccept(manifest(), manifest({ deviceId: 'emulator' }))).toBe('otherDevice');
    expect(checkAccept(manifest(), manifest({ deviceId: 'emulator', workouts: 12 }))).toBe('otherDevice');
  });

  it('takes the same device with as many or more workouts', () => {
    expect(checkAccept(manifest(), manifest({ workouts: 312 }))).toBeNull();
    expect(checkAccept(manifest(), manifest({ workouts: 313 }))).toBeNull();
  });

  it('refuses a copy whose last workout is older than the PC copy\'s', () => {
    const pc = manifest({ lastWorkout: '2026-11-06T15:31:57.722Z' });
    expect(checkAccept(pc, manifest({ workouts: 313, lastWorkout: '2026-11-03T19:45:42.227Z' }))).toBe('older');
    expect(checkAccept(pc, manifest({ lastWorkout: '2026-11-06T15:31:57.722Z' }))).toBeNull();
    expect(checkAccept(pc, manifest({ lastWorkout: '2026-11-07T10:00:00.000Z' }))).toBeNull();
    // A phone on an older version sends no date: counted as before.
    expect(checkAccept(pc, manifest())).toBeNull();
  });

  it('force takes anything', () => {
    expect(checkAccept(manifest(), { ...manifest({ deviceId: 'emulator', workouts: 1 }), force: true })).toBeNull();
  });
});

describe('filesToSend', () => {
  const pc = [{ path: 'media/a.jpg', size: 10 }];

  it('always sends the database, and only new media', () => {
    const phone = [
      { path: 'hevier.db', size: 100 },
      { path: 'media/a.jpg', size: 10 },
      { path: 'media/b.jpg', size: 5 },
    ];
    expect(filesToSend(phone, pc)).toEqual(['hevier.db', 'media/b.jpg']);
  });

  it('sends a file whose size changed', () => {
    expect(filesToSend([{ path: 'media/a.jpg', size: 11 }], pc)).toEqual(['media/a.jpg']);
  });
});
