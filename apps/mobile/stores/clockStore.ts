import { useSyncExternalStore } from 'react';

import { resetTimer, initialClock } from '@/lib/clock';
import type { ClockState } from '@/types/clock';

// The Clock sheet's one shared state (lib/clock.ts has the maths), so a timer
// keeps running while the sheet is closed; it buzzes and chimes at zero.

let state: ClockState = initialClock;
const listeners = new Set<() => void>();
let alarm: ReturnType<typeof setTimeout> | null = null;
let onTimerDone: (() => void) | null = null;

// What happens at zero (the buzz and chime), set by the app at startup.
export function setTimerDoneHandler(handler: () => void) {
  onTimerDone = handler;
}

export function updateClock(change: (s: ClockState) => ClockState) {
  state = change(state);
  if (alarm) clearTimeout(alarm);
  alarm = null;
  if (state.timerEndsAt !== null) {
    alarm = setTimeout(() => {
      alarm = null;
      state = resetTimer(state);
      listeners.forEach((l) => l());
      onTimerDone?.();
    }, Math.max(0, state.timerEndsAt - Date.now()));
  }
  listeners.forEach((l) => l());
}

export function useClock(): ClockState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state
  );
}
