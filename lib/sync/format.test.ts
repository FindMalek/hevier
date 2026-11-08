import { describe, expect, it } from 'vitest';
import { lastSyncedLabel, restoreMessage, syncMessage } from './format';

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
