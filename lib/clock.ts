import { CLOCK_DEFAULTS } from '@/constants/defaults';
import { CLOCK_LIMITS } from '@/constants/limits';
import type { ClockState } from '@/types/clock';

// The Clock sheet's timer and stopwatch:
// plain functions over a small state. The shared state, which keeps a timer
// running while the sheet is closed, is stores/clockStore.ts.

export const initialClock: ClockState = {
  mode: CLOCK_DEFAULTS.mode,
  timerSeconds: CLOCK_DEFAULTS.timerSeconds,
  timerEndsAt: null,
  timerLeftMs: null,
  watchStartedAt: null,
  watchElapsedMs: 0,
};

export function timerLeft(s: ClockState, now: number): number {
  if (s.timerEndsAt !== null) return Math.max(0, s.timerEndsAt - now);
  return s.timerLeftMs ?? s.timerSeconds * 1000;
}

export const timerRunning = (s: ClockState) => s.timerEndsAt !== null;
export const timerPaused = (s: ClockState) => s.timerEndsAt === null && s.timerLeftMs !== null;

export function startTimer(s: ClockState, now: number): ClockState {
  return { ...s, timerEndsAt: now + timerLeft(s, now), timerLeftMs: null };
}

export function pauseTimer(s: ClockState, now: number): ClockState {
  if (s.timerEndsAt === null) return s;
  return { ...s, timerEndsAt: null, timerLeftMs: Math.max(0, s.timerEndsAt - now) };
}

export function resetTimer(s: ClockState): ClockState {
  return { ...s, timerEndsAt: null, timerLeftMs: null };
}

// -15s / +15s: moves a running or paused timer; otherwise changes what it's set to.
export function adjustTimer(s: ClockState, seconds: number, now: number): ClockState {
  if (s.timerEndsAt !== null) return { ...s, timerEndsAt: Math.max(now, s.timerEndsAt + seconds * 1000) };
  if (s.timerLeftMs !== null) return { ...s, timerLeftMs: Math.max(0, s.timerLeftMs + seconds * 1000) };
  return { ...s, timerSeconds: Math.max(CLOCK_LIMITS.minTimerSeconds, s.timerSeconds + seconds) };
}

export function watchElapsed(s: ClockState, now: number): number {
  return s.watchStartedAt !== null ? now - s.watchStartedAt : s.watchElapsedMs;
}

export const watchRunning = (s: ClockState) => s.watchStartedAt !== null;

export function startWatch(s: ClockState, now: number): ClockState {
  return s.watchStartedAt !== null ? s : { ...s, watchStartedAt: now - s.watchElapsedMs };
}

export function pauseWatch(s: ClockState, now: number): ClockState {
  return s.watchStartedAt === null ? s : { ...s, watchStartedAt: null, watchElapsedMs: now - s.watchStartedAt };
}

export function resetWatch(s: ClockState): ClockState {
  return { ...s, watchStartedAt: null, watchElapsedMs: 0 };
}
