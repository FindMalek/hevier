// The messages of the sync protocol (shared/sync-protocol.ts), used by the app
// and backup-server.

export type FileEntry = { path: string; size: number };

// The copy on the PC is described by the manifest the phone sent with it.
export type Manifest = {
  deviceId: string;
  date: string; // ISO, when the phone made it
  workouts: number;
  files: FileEntry[];
};

export type BeginRequest = Manifest & { force?: boolean };

export type BeginResponse = { need: string[] };

export type Refusal = { reason: 'fewer' | 'otherDevice'; pc: { workouts: number; date: string } };

export type StatusResponse = { backup: Manifest | null };
