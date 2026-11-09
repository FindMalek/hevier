import type { MuscleGroup } from '@/types/muscles';
import type { FootballRating } from '@/types/football';

// Football (small-sided games) in the app. A game is logged like any other
// exercise, never counts as sets, but its soreness adds fatigue to the legs
// in Recovery. The maths that uses these is in lib/training/football.ts.
//
// The model:
// - a normal game leaves FOOTBALL_LOAD on each muscle (1.0 = a full session);
// - longer games tire less per minute (players pace themselves):
//   (minutes / FOOTBALL_REFERENCE_MINUTES) ^ FOOTBALL_LENGTH_EXPONENT;
// - the easy / normal / hard tap scales it;
// - fatigue stays full for the first day (soreness peaks 24–48 h after a game),
//   then fades with a half-life.

// The exercise name that marks a game (it is logged like any other exercise).
export const FOOTBALL = 'Football';

// How hard a game was: the choices on the tap in Log Workout, in order.
// The FootballRating type (types/football.ts) is built from this list.
export const FOOTBALL_RATINGS = ['easy', 'normal', 'hard'] as const;

export const FOOTBALL_LOAD: Partial<Record<MuscleGroup, number>> = {
  Hamstrings: 0.8, // sprinting, and braking the leg at the end of each stride
  Quadriceps: 0.7, // braking
  Adductors: 0.6, // cutting and side-foot passes
  Calves: 0.5,
  Glutes: 0.5,
  Abductors: 0.3,
  Abdominals: 0.2,
};

export const FOOTBALL_REFERENCE_MINUTES = 90; // a normal game
export const FOOTBALL_LENGTH_EXPONENT = 0.7;
export const FOOTBALL_MAX_MINUTES = 150; // a typo like 900 min shouldn't wipe out the legs for a week
export const FOOTBALL_FULL_FOR_HOURS = 24;
export const FOOTBALL_HALF_LIFE_HOURS = 30;

// The easy / normal / hard tap, saved in sets.rpe as a session RPE out of 10.
export const FOOTBALL_RATING_RPE: Record<FootballRating, number> = { easy: 4, normal: 6, hard: 8 };
export const FOOTBALL_RATING_SCALE: Record<FootballRating, number> = { easy: 0.7, normal: 1, hard: 1.3 };
export const FOOTBALL_EASY_MAX_RPE = 5; // RPE 5 or less reads as easy
export const FOOTBALL_HARD_MIN_RPE = 7; // RPE 7 or more reads as hard

// Fatigue left from games on a muscle: above this = red, from the next = orange.
export const FOOTBALL_FATIGUED = 0.6;
export const FOOTBALL_RECOVERING = 0.3;
