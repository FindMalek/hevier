import type { CALENDAR_VIEWS } from '@/constants/labels';

// The calendar's view: one of CALENDAR_VIEWS.
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

// One workout on a calendar day.
export interface DayWorkout {
  id: string;
  title: string;
}

// Workouts by local day ("2026-10-13").
export type WorkoutDays = Map<string, DayWorkout[]>;

// A workout as the calendar needs it, before grouping by day.
export interface CalendarWorkout {
  id: string;
  title: string;
  startTime: string;
}
