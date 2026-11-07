import type { FOOTBALL_RATINGS } from '@/constants/football';

// How hard a football game was: one of FOOTBALL_RATINGS.
export type FootballRating = (typeof FOOTBALL_RATINGS)[number];
