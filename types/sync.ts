import type { FileEntry, Refusal } from '@/shared/sync-types';

// Where the PC's Hevier Sync window is, and its key (lib/sync/pairing.ts).
export type Pairing = { host: string; port: number; key: string };

// What a transfer reports back to the stall timeout (lib/sync/transfer.ts):
// `onProgress` each time bytes move, and `signal` aborts the transfer.
export type TransferHooks = { signal: AbortSignal; onProgress: () => void };

// A code the scanner read: the PC it names and the text it was read from.
export type FoundPairing = { pairing: Pairing; code: string };

// hooks/useSavePairing.ts: `confirm` saves the pairing; `saving` is true from
// the tap until a failed save lets the user try again, and `error` is that
// failure in words for the user.
export interface SavePairingState {
  confirm: (pairing: Pairing | null) => Promise<void>;
  saving: boolean;
  error: string | null;
  clearError: () => void;
}

// How lib/sync/client.ts reaches the files, so it runs in tests.
export interface SyncIO {
  // A fresh database copy plus the photos, ready to send.
  snapshot(): Promise<{ deviceId: string; workouts: number; lastWorkout: string | null; files: FileEntry[] }>;
  upload(url: string, path: string, headers: Record<string, string>, hooks?: TransferHooks): Promise<number>;
  cleanup(): Promise<void>;
  // Restore: each file is first downloaded to a staging folder…
  download(url: string, path: string, headers: Record<string, string>, hooks?: TransferHooks): Promise<{ status: number; size: number }>;
  // …and only once all arrived do they replace the phone's data.
  replaceAll(paths: string[]): Promise<void>;
}

export type SyncFailure = {
  ok: false;
  reason: 'notPaired' | 'pcNotFound' | 'wrongKey' | 'busy' | 'timeout' | 'restoreKept' | Refusal['reason'] | 'error';
  pc?: Refusal['pc'];
  phoneWorkouts?: number;
};
export type SyncResult = { ok: true; at: string } | SyncFailure;

// One thing a restore sets aside: a database file (in documents/SQLite) or a
// photo folder (in documents).
export type RestoreItem = { name: string; folder: boolean };
