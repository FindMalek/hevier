import { PERIOD_LABELS } from '@/constants/labels';

// The periods every range menu offers (routine and exercise charts, Set
// Count, Muscle Distribution), the same as the Profile chart's (constants/profile.ts
// PROFILE_RANGES, which adds how its bars are cut). Whole days, today included.
// The Period type (types/stats.ts) is built from this list.
export const PERIODS = [
  { label: PERIOD_LABELS.last15Days, days: 15 },
  { label: PERIOD_LABELS.last30Days, days: 30 },
  { label: PERIOD_LABELS.last3Months, days: 91 },
  { label: PERIOD_LABELS.last6Months, days: 182 },
  { label: PERIOD_LABELS.year, days: 365 },
  { label: PERIOD_LABELS.allTime, days: null },
] as const;
