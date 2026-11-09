import { BODY_WEIGHT_LIMITS } from '@/constants/weight';
import { parseNumber } from '@/lib/format/setFormat';
import { round2 } from '@/lib/format/weight';
import type { BodyWeightChange, BodyWeightEntry } from '@/types/bodyWeight';

// A typed body weight in kg ("82,5" too), or null when empty or outside BODY_WEIGHT_LIMITS.
export function parseBodyWeight(text: string): number | null {
  const kg = parseNumber(text);
  if (kg === null || kg < BODY_WEIGHT_LIMITS.minKg || kg > BODY_WEIGHT_LIMITS.maxKg) return null;
  return Math.round(kg * 10) / 10;
}

// Last minus first of `entries` (oldest first); null with fewer than two.
export function bodyWeightChange(entries: BodyWeightEntry[]): BodyWeightChange | null {
  if (entries.length < 2) return null;
  const first = entries[0];
  const last = entries[entries.length - 1];
  return { deltaKg: Math.round((last.weightKg - first.weightKg) * 10) / 10, since: first.loggedAt };
}

// "Gained 1.5 kg", "Lost 2 kg", "Same weight" (the date is added by the page).
export function changeLabel(deltaKg: number): string {
  if (deltaKg > 0) return `Gained ${round2(deltaKg)} kg`;
  if (deltaKg < 0) return `Lost ${round2(-deltaKg)} kg`;
  return 'Same weight';
}
