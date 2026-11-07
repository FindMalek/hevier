import type { CLOCK_MODES } from '@/constants/ui';

// The Clock sheet's timer and stopwatch (lib/clock.ts, stores/clockStore.ts).

// Timer or stopwatch: one of CLOCK_MODES.
export type ClockMode = (typeof CLOCK_MODES)[number];

export interface ClockState {
  mode: ClockMode;
  timerSeconds: number; // what the timer is set to (01:00 at first)
  timerEndsAt: number | null; // running: when it reaches zero
  timerLeftMs: number | null; // paused: what was left
  watchStartedAt: number | null; // running: since when (minus earlier runs)
  watchElapsedMs: number; // paused: the time so far
}
