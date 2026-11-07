import { PERIOD_LABELS } from '@/constants/labels';

// What the Profile chart can show, in the order of its chips (app/(tabs)/profile.tsx).
// The ProfileMetric type (types/profile.ts) is built from this list.
export const PROFILE_METRICS = ['duration', 'volume', 'reps'] as const;

// The Profile chart's ranges. 'Last 3 months' is the last 12 weeks, this one
// included; Year and All time have a bar per month; 15 and 30 days a bar per
// day; 6 months (26 weeks) a bar per week. The ProfileRange type (types/profile.ts) is built from this list.
export const PROFILE_RANGES = [
  { label: PERIOD_LABELS.last15Days, unit: 'day', count: 15 },
  { label: PERIOD_LABELS.last30Days, unit: 'day', count: 30 },
  { label: PERIOD_LABELS.last3Months, unit: 'week', count: 12 },
  { label: PERIOD_LABELS.last6Months, unit: 'week', count: 26 },
  { label: PERIOD_LABELS.year, unit: 'month', count: 12 },
  { label: PERIOD_LABELS.allTime, unit: 'month', count: null },
] as const;

// The profile's name and @username until they're set in Edit Profile. Put your
// own in .env (see .env.example); Expo builds them into the app.
export const PROFILE_DEFAULTS = {
  name: process.env.EXPO_PUBLIC_PROFILE_NAME || 'Athlete',
  username: process.env.EXPO_PUBLIC_PROFILE_USERNAME || 'athlete',
};
