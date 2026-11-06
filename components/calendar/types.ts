import type { ReactElement } from 'react';

import type { WorkoutDays } from '@/types/calendar';
import type { Profile } from '@/types/profile';

// Props and local types of the calendar views (components/calendar/).

// A month of the Month view's list.
export interface MonthItem {
  year: number;
  month: number;
}

export interface MonthViewProps {
  days: WorkoutDays;
  profile: Profile;
  onDay: (date: Date) => void;
  bottomSpace: ReactElement;
}

export interface MonthProps extends MonthItem {
  days: WorkoutDays;
  onDay: (date: Date) => void;
}

export interface YearViewProps {
  days: WorkoutDays;
  bottomSpace: ReactElement;
}

export interface MultiYearViewProps {
  days: WorkoutDays;
}

// What every Year / Multi-year grid needs to colour its squares.
export interface GridColours {
  trained: Set<number>;
  today: number;
}

export interface MiniMonthProps extends GridColours {
  year: number;
  month: number;
}

export interface YearBlockProps extends GridColours {
  year: number;
}

export interface MultiYearBlockProps extends GridColours {
  year: number;
  width: number;
}

// One square of a grid: its cell key and its column / row.
export interface GridCell {
  key: number;
  col: number;
  row: number;
}

// A grid's squares and how many columns / rows it spans.
export interface GridLayout {
  cells: GridCell[];
  cols: number;
  rows: number;
}
