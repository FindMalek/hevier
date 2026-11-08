// The messages of the sync protocol (packages/shared/sync-protocol.ts), used by the app
// and apps/sync.

export type FileEntry = { path: string; size: number };

// The copy on the PC is described by the manifest the phone sent with it.
export type Manifest = {
  deviceId: string;
  date: string; // ISO, when the phone made it
  workouts: number;
  // When the newest workout started (ISO); missing from phones on older versions.
  lastWorkout?: string | null;
  files: FileEntry[];
};

export type BeginRequest = Manifest & { force?: boolean };

export type BeginResponse = { need: string[] };

export type Refusal = { reason: 'fewer' | 'older' | 'otherDevice'; pc: { workouts: number; date: string } };

export type StatusResponse = { backup: Manifest | null };
