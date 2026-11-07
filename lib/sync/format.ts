import type { Manifest } from '@/shared/sync-types';
import { clock24, compactDateTime } from '@/lib/format/date';
import type { Pairing, SyncResult } from '@/types/sync';

// Words for the Sync with PC screen (app/sync.tsx).

export function lastSyncedLabel(iso: string | null, now = new Date()): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toDateString() === now.toDateString() ? `Today ${clock24(d)}` : compactDateTime(d);
}

// The Restore from PC confirmation.
export function restoreMessage(backup: Manifest, now = new Date()): string {
  return `Restore from PC?\n\nBackup from ${lastSyncedLabel(backup.date, now)}, ${backup.workouts} workouts. This replaces everything on this phone, including a workout in progress.`;
}

// The Pair with PC confirmation, shown before a scanned or opened link is saved.
export function pairMessage({ host, port }: Pairing, local: boolean): string {
  if (local) return `Pair with ${host}:${port}?\n\nThis phone will send a copy of your workouts and photos there. Only continue if that is your PC.`;
  return `${host}:${port} is outside your local network.\n\nPairing sends a copy of all your workouts and photos to it. Only continue if you know this address.`;
}

export function syncMessage(result: SyncResult, usb = false): string {
  if (result.ok) return 'Synced';
  switch (result.reason) {
    case 'notPaired':
      return 'Open Hevier Sync on your PC, then scan its QR code.';
    case 'pcNotFound':
      return usb
        ? 'PC not found over the cable. Plug the phone into the PC (USB debugging on) and open Hevier Sync there.'
        : 'PC not found. Is Hevier Sync open? If it is, scan the QR again.';
    case 'wrongKey':
      return "This PC doesn't know this phone. Scan the QR again.";
    case 'fewer':
      return `Your phone has fewer workouts than the PC copy (${result.phoneWorkouts} vs ${result.pc?.workouts}). Not sent.`;
    case 'older':
      return "This phone's last workout is older than the one in the PC copy. Not sent.";
    case 'otherDevice':
      return 'This copy came from another phone. Replace it?';
    case 'error':
      return 'Sync failed. Try again.';
  }
}
