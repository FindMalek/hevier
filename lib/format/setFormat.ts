import { clock } from '@/lib/format/duration';
import type { ExerciseType } from '@/types/exercise';
import type { SetText, SetType, SetValues } from '@/types/workout';

// Text shown and typed in set tables (routine editor, routine page, log).

// The SET column: W for a warm-up, F for a failure set, and the
// normal sets numbered 1, 2, 3 on their own.
export function setBadges(types: SetType[]): string[] {
  let n = 0;
  return types.map((t) => (t === 'warmup' ? 'W' : t === 'failure' ? 'F' : String(++n)));
}

// What the user typed in a TIME box: "6:23", "06:23" or plain seconds "383".
export function parseClock(text: string): number | null {
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(':');
  if (parts.length === 2) {
    const [m, s] = parts.map(Number);
    return Number.isFinite(m) && Number.isFinite(s) ? m * 60 + s : null;
  }
  const n = Number(t);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// The TIME box as the user types digits (Android number pads have no ":"):
// they fill in from the right, so 1 → "00:01", 100 → "01:00", 1000 → "10:00".
export function typeClock(text: string): string {
  const digits = text.replace(/\D/g, '').replace(/^0+/, '').slice(-4);
  if (!digits) return '';
  const d = digits.padStart(4, '0');
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

export function parseNumber(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// Dumbbell weight per hand (db/perHand/perHand.ts): sets keep the total, the KG box
// and labels show one dumbbell.
export function perHandKg(totalKg: number): number {
  return Math.round(totalKg * 50) / 100;
}

// The KG box text both ways; half-typed text ("12.") gives the nearest number.
export function perHandText(total: string): string {
  const n = parseNumber(total);
  return n === null ? '' : String(perHandKg(n));
}

export function totalText(perHand: string): string {
  const n = parseNumber(perHand);
  return n === null ? '' : String(Math.round(n * 200) / 100);
}

// Grey PREVIOUS column: "120kg x 10", "x 12", "07:50", "2.5km 15:00".
// Per hand: the one dumbbell, like the KG box next to it.
export function previousLabel(type: ExerciseType, s: SetValues | undefined, perHand = false): string {
  if (!s) return '-';
  switch (type) {
    case 'weight_reps':
      return `${perHand ? perHandKg(s.weightKg ?? 0) : (s.weightKg ?? 0)}kg x ${s.reps ?? 0}`;
    case 'reps_only':
      return `x ${s.reps ?? 0}`;
    case 'duration':
      return clock(s.durationSeconds) || '-';
    case 'distance_duration':
      return `${s.distanceKm ?? 0}km ${clock(s.durationSeconds)}`.trim();
  }
}

// A saved set on the workout page: "80kg x 10", "12 reps", "06:23",
// "2.5km - 12:00"; per hand "15kg each x 10".
export function setValue(type: ExerciseType, s: SetValues, perHand = false): string {
  if (type === 'weight_reps') {
    if (!s.weightKg) return `${s.reps ?? 0} reps`;
    return perHand ? `${perHandKg(s.weightKg)}kg each x ${s.reps ?? 0}` : `${s.weightKg}kg x ${s.reps ?? 0}`;
  }
  if (type === 'reps_only') return `${s.reps ?? 0} reps`;
  if (type === 'duration') return clock(s.durationSeconds) || '-';
  return `${s.distanceKm ?? 0}km - ${clock(s.durationSeconds) || '0:00'}`;
}

// A saved set's numbers as the text boxes show them ("" for none). The TIME
// box can start empty instead (Warm Up from a routine starts at 00:00).
export function setTextOf(s: SetValues, keepTime = true): SetText {
  const text = (n: number | null) => (n === null ? '' : String(n));
  return {
    weight: text(s.weightKg),
    reps: text(s.reps),
    km: text(s.distanceKm),
    time: keepTime ? clock(s.durationSeconds) : '',
  };
}
