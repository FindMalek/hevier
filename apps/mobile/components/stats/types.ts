import type { ReactNode } from 'react';
import type { Href } from 'expo-router';

import type { RadarMuscle } from '@/types/muscles';
import type { Conditioning, PeriodLoad, StripDay } from '@/types/stats';

// Props and local types of the Statistics pieces (components/stats/).

// Where the radar sits in its Svg.
export interface RadarLayout {
  size: number; // width
  height: number;
  cx: number;
  cy: number;
  radius: number; // the outer ring
}

export type Point = readonly [number, number];

// Which way a muscle's label hangs off its spoke.
export type LabelAnchor = 'start' | 'middle' | 'end';

export interface RadarChartProps {
  width: number;
  now: PeriodLoad;
  before: PeriodLoad;
  scale: number;
  selected: RadarMuscle | null;
  onSelect: (muscle: RadarMuscle | null) => void;
}

export interface PushPullCardProps {
  push: number;
  pull: number;
}

export interface StatCardProps {
  title: string;
  value: string;
  change: number;
  format: (n: number) => string;
}

export interface DistributionInfoSheetProps {
  visible: boolean;
  onDismiss: () => void;
}

export interface SevenDayStripProps {
  days: StripDay[]; // oldest first; the last is today
}

export interface ConditioningCardProps {
  cardio: Conditioning;
}

// One row of "Advanced statistics": its icon, words and page.
export interface AdvancedStatsRow {
  icon: ReactNode;
  title: string;
  subtitle: string;
  href: Href;
}
