import { describe, expect, it } from 'vitest';
import { lastSyncedLabel, pairMessage, restoreMessage, syncMessage } from './format';

describe('lastSyncedLabel', () => {
  const now = new Date(2026, 9, 24, 20, 0);
  it('Never, Today, or the date', () => {
    expect(lastSyncedLabel(null, now)).toBe('Never');
    expect(lastSyncedLabel(new Date(2026, 9, 24, 18, 42).toISOString(), now)).toBe('Today 18:42');
    expect(lastSyncedLabel(new Date(2026, 9, 23, 9, 5).toISOString(), now)).toBe('23 Oct 09:05');
  });
});

describe('syncMessage', () => {
  it('says what went wrong in plain words', () => {
    expect(syncMessage({ ok: false, reason: 'pcNotFound' })).toBe('PC not found. Is Hevier Sync open? If it is, scan the QR again.');
    expect(syncMessage({ ok: false, reason: 'pcNotFound' }, true)).toContain('over the cable');
    expect(syncMessage({ ok: false, reason: 'wrongKey' })).toBe("This PC doesn't know this phone. Scan the QR again.");
    expect(syncMessage({ ok: false, reason: 'fewer', pc: { workouts: 312, date: '' }, phoneWorkouts: 12 })).toBe(
      'Your phone has fewer workouts than the PC copy (12 vs 312). Not sent.'
    );
    expect(syncMessage({ ok: false, reason: 'otherDevice' })).toBe('This copy came from another phone. Replace it?');
    expect(syncMessage({ ok: false, reason: 'error' })).toBe('Sync failed. Try again.');
    expect(syncMessage({ ok: false, reason: 'timeout' })).toMatch(/stopped answering/);
    expect(syncMessage({ ok: true, at: '' })).toBe('Synced');
  });
});

describe('restoreMessage', () => {
  it('tells what the PC has and what gets replaced', () => {
    const date = new Date(2026, 9, 24, 18, 42).toISOString();
    expect(restoreMessage({ deviceId: 'a', date, workouts: 312, files: [] }, new Date(2026, 9, 25, 9, 0))).toBe(
      'Restore from PC?\n\nBackup from 24 Oct 18:42, 312 workouts. This replaces everything on this phone, including a workout in progress.'
    );
  });
});

describe('restoreMessage space', () => {
  it('says how much room a restore needs: the download, the new data and the old data at once', () => {
    const date = new Date(2026, 9, 24, 18, 42).toISOString();
    const files = [{ path: 'hevier.db', size: 10 * 1024 * 1024 }, { path: 'media/a.jpg', size: 502 * 1024 * 1024 }];
    expect(restoreMessage({ deviceId: 'a', date, workouts: 3, files }, new Date(2026, 9, 25, 9, 0))).toContain('needs about 1.5 GB free');
  });
});

describe('pairMessage', () => {
  const next = { host: '192.168.1.23', port: 4873, key: '' };

  it('names the host, and warns when it is outside the local network', () => {
    expect(pairMessage(next, true, null)).toMatch(/^Pair with 192\.168\.1\.23:4873\?/);
    const warning = pairMessage({ ...next, host: 'evil.example.com' }, false, null);
    expect(warning).toContain('evil.example.com:4873 is outside your local network');
    expect(warning).toContain('Only continue if you know this address');
  });

  it('says it replaces the PC this phone is already paired with', () => {
    const current = { host: '192.168.1.40', port: 4873, key: '' };
    expect(pairMessage(next, true, current)).toMatch(/\n\nThis replaces your current PC \(192\.168\.1\.40\)\.$/);
    expect(pairMessage({ ...next, host: 'evil.example.com' }, false, current)).toContain('This replaces your current PC (192.168.1.40).');
  });

  it('says nothing about a current PC when the phone is not paired', () => {
    expect(pairMessage(next, true, null)).not.toContain('replaces');
  });
});
