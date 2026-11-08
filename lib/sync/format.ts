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
  const base = `Restore from PC?\n\nBackup from ${lastSyncedLabel(backup.date, now)}, ${backup.workouts} workouts. This replaces everything on this phone, including a workout in progress.`;
  const bytes = backup.files.reduce((sum, f) => sum + f.size, 0);
  return bytes > 0 ? `${base}\n\nWhile it runs the phone needs about ${sizeLabel(bytes * RESTORE_SPACE_FACTOR)} free: the download, the new copy and your current data are all kept until it is done.` : base;
}

// A restore keeps three copies at once: the staged download, the new data, and the old data set aside.
const RESTORE_SPACE_FACTOR = 3;

function sizeLabel(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.max(1, Math.round(mb))} MB`;
}

// The Pair with PC confirmation, shown before a scanned or opened link is
// saved. `current` is the PC this phone is already paired with, if any.
export function pairMessage({ host, port }: Pairing, local: boolean, current: Pairing | null): string {
  const question = local
    ? `Pair with ${host}:${port}?\n\nThis phone will send a copy of your workouts and photos there. Only continue if that is your PC.`
    : `${host}:${port} is outside your local network.\n\nPairing sends a copy of all your workouts and photos to it. Only continue if you know this address.`;
  return current ? `${question}\n\nThis replaces your current PC (${current.host}).` : question;
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
    case 'restoreKept':
      return 'Restore failed, and some of your data is in a safe copy on this phone. Close Hevier and open it again to put it back.';
    case 'timeout':
      return 'The PC stopped answering during the transfer. Check the Wi-Fi and try again.';
    case 'busy':
      return 'Another sync or restore is still running. Try again in a moment.';
    case 'error':
      return 'Sync failed. Try again.';
  }
}
