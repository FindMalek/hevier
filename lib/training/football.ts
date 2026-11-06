import type { MuscleGroup } from '@/types/muscles';
import {
  FOOTBALL_EASY_MAX_RPE,
  FOOTBALL_FULL_FOR_HOURS,
  FOOTBALL_HALF_LIFE_HOURS,
  FOOTBALL_HARD_MIN_RPE,
  FOOTBALL_LENGTH_EXPONENT,
  FOOTBALL_LOAD,
  FOOTBALL_MAX_MINUTES,
  FOOTBALL_RATING_RPE,
  FOOTBALL_RATING_SCALE,
  FOOTBALL_REFERENCE_MINUTES,
} from '@/constants/football';
import type { FootballRating } from '@/types/football';

// Football (5-a-side) in the recovery view. It isn't lifting near failure, so
// it never counts as sets (weekly sets, zones, distribution, push/pull), but
// the soreness after a game is real, so it adds fatigue to the legs.
// The model and its numbers are in constants/training.ts (Football section).

// Saved in sets.rpe (a session RPE, out of 10); a game saved without one is normal.
export function ratingToRpe(rating: FootballRating): number {
  return FOOTBALL_RATING_RPE[rating];
}

export function rpeToRating(rpe: number | null | undefined): FootballRating {
  if (rpe === null || rpe === undefined) return 'normal';
  return rpe <= FOOTBALL_EASY_MAX_RPE ? 'easy' : rpe >= FOOTBALL_HARD_MIN_RPE ? 'hard' : 'normal';
}

// How big a game is, 1 = a normal game of FOOTBALL_REFERENCE_MINUTES.
export function footballScale(minutes: number, rating: FootballRating = 'normal'): number {
  const m = Math.min(Math.max(minutes, 0), FOOTBALL_MAX_MINUTES);
  return (m / FOOTBALL_REFERENCE_MINUTES) ** FOOTBALL_LENGTH_EXPONENT * FOOTBALL_RATING_SCALE[rating];
}

// What's left of a game's fatigue `hours` after it started.
export function footballLeft(load: number, hours: number): number {
  if (hours < 0) return 0;
  return hours <= FOOTBALL_FULL_FOR_HOURS
    ? load
    : load * 0.5 ** ((hours - FOOTBALL_FULL_FOR_HOURS) / FOOTBALL_HALF_LIFE_HOURS);
}

// Fatigue per muscle from one game, `hours` after it started.
export function footballFatigue(minutes: number, rating: FootballRating, hours: number): Map<MuscleGroup, number> {
  const scale = footballScale(minutes, rating);
  const result = new Map<MuscleGroup, number>();
  for (const [muscle, load] of Object.entries(FOOTBALL_LOAD) as [MuscleGroup, number][]) {
    result.set(muscle, footballLeft(load * scale, hours));
  }
  return result;
}
