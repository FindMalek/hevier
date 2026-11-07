import type { FileEntry, Refusal } from '@/shared/sync-types';

// Where the PC's Hevier Sync window is, and its key (lib/sync/pairing.ts).
export type Pairing = { host: string; port: number; key: string };

// How lib/sync/client.ts reaches the files, so it runs in tests.
export interface SyncIO {
  // A fresh database copy plus the photos, ready to send.
  snapshot(): Promise<{ deviceId: string; workouts: number; lastWorkout: string | null; files: FileEntry[] }>;
  upload(url: string, path: string, headers: Record<string, string>): Promise<number>;
  cleanup(): Promise<void>;
  // Restore: each file is first downloaded to a staging folder…
  download(url: string, path: string, headers: Record<string, string>): Promise<{ status: number; size: number }>;
  // …and only once all arrived do they replace the phone's data.
  replaceAll(paths: string[]): Promise<void>;
}

export type SyncFailure = {
  ok: false;
  reason: 'notPaired' | 'pcNotFound' | 'wrongKey' | Refusal['reason'] | 'error';
  pc?: Refusal['pc'];
  phoneWorkouts?: number;
};
export type SyncResult = { ok: true; at: string } | SyncFailure;
