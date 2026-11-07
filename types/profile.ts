import type { PROFILE_METRICS, PROFILE_RANGES } from '@/constants/profile';
import type { WorkoutSession } from './workout';

// The Profile tab (db/profile/profile.ts): one past workout with its totals
// (db/sessions/sessions.ts), for the chart.
export type ProfileSession = WorkoutSession;

export interface Profile {
  name: string;
  username: string;
  sessions: ProfileSession[]; // oldest first
}

// What the Profile chart shows: one of PROFILE_METRICS.
export type ProfileMetric = (typeof PROFILE_METRICS)[number];

// A range of the Profile chart: one of PROFILE_RANGES.
export type ProfileRange = (typeof PROFILE_RANGES)[number];

// What one bar of the chart covers: a day, a week or a month.
export type BarUnit = ProfileRange['unit'];

// One bar of the Profile chart (lib/stats/profileCharts.ts).
export interface Bar {
  start: Date;
  value: number;
}

// Edit Profile: one labelled text field.
export interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none';
}
