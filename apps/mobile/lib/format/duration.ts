import { MS_PER_SECOND, SECONDS_PER_HOUR, SECONDS_PER_MINUTE } from '@/constants/time';

// Every way the app writes a length of time. The formats differ on purpose
// (each matches its screen), so they sit side by side, not merged.

// 5 → "05"
export const pad2 = (n: number): string => String(n).padStart(2, '0');

// ---- Clocks ----

// Set TIME box and rest countdown: "06:23" (minutes keep counting past an hour).
export function clock(seconds: number | null): string {
  if (seconds === null) return '';
  return `${pad2(Math.floor(seconds / SECONDS_PER_MINUTE))}:${pad2(seconds % SECONDS_PER_MINUTE)}`;
}

// Clock sheet timer "01:00" (rounded up, so it shows 00:01 until the very end; "1:05:00" past an hour).
export function timerLabel(ms: number): string {
  const total = Math.ceil(ms / MS_PER_SECOND);
  const h = Math.floor(total / SECONDS_PER_HOUR);
  const mm = pad2(Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE));
  const ss = pad2(total % SECONDS_PER_MINUTE);
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Clock sheet stopwatch "00:00:00": hours, minutes, seconds.
export function watchLabel(ms: number): string {
  const total = Math.floor(ms / MS_PER_SECOND);
  return `${pad2(Math.floor(total / SECONDS_PER_HOUR))}:${pad2(Math.floor((total % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE))}:${pad2(total % SECONDS_PER_MINUTE)}`;
}

// ---- Words ----

// Rest timer: "OFF", "45s", "2min 45s", and "3min 0s" for whole minutes.
export function restLabel(seconds: number | null): string {
  if (!seconds) return 'OFF';
  const m = Math.floor(seconds / SECONDS_PER_MINUTE);
  return m ? `${m}min ${seconds % SECONDS_PER_MINUTE}s` : `${seconds}s`;
}

// Duration while logging: "17s", "1min 5s", "1h 9min" (no seconds past an hour).
export function elapsedLabel(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < SECONDS_PER_MINUTE) return `${s}s`;
  if (s < SECONDS_PER_HOUR) return `${Math.floor(s / SECONDS_PER_MINUTE)}min ${s % SECONDS_PER_MINUTE}s`;
  return `${Math.floor(s / SECONDS_PER_HOUR)}h ${Math.floor((s % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)}min`;
}

// Exercise page records: "17s", "7min 50s", "1h 12min 38s" (seconds kept past an hour).
export function recordDurationLabel(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / SECONDS_PER_HOUR);
  const m = Math.floor((s % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  if (h > 0) return `${h}h ${m}min ${s % SECONDS_PER_MINUTE}s`;
  if (m > 0) return `${m}min ${s % SECONDS_PER_MINUTE}s`;
  return `${s}s`;
}
