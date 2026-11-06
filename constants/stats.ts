// The sides of Push / Pull (lib/training/pushPull.ts): arms are kept apart.
// The PushPullSide type (types/stats.ts) is built from this list.
export const PUSH_PULL_SIDES = ['push', 'pull', 'armPush', 'armPull'] as const;

// A muscle's state on the recovery body map (lib/training/effort.ts), from best to worst.
// The RecoveryState type (types/stats.ts) is built from this list.
export const RECOVERY_STATES = ['ready', 'recovering', 'fatigued'] as const;

// The two views of the Statistics body map, as its pills show them.
export const BODY_VIEWS = [
  { key: 'hard', label: 'Sets' },
  { key: 'recovery', label: 'Recovery' },
] as const;
