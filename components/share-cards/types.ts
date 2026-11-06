import type { ReactNode } from 'react';

import type { SHARE_CARD_STRIPES } from '@/constants/ui';
import type { WorkoutCardData } from '@/types/feed';
import type { BodyPart } from '@/types/muscles';
import type { RecordKind } from '@/types/records';
import type { StripDay, WeightComparison } from '@/types/stats';

// Props and local types of the "Nice work!" share cards (components/share-cards/).

export type ShareCardStripes = (typeof SHARE_CARD_STRIPES)[number];

export interface ShareCardProps {
  size: number;
  username: string;
  stripes?: ShareCardStripes;
  centered?: boolean;
  footer?: boolean;
  children: ReactNode;
}

export interface StripesProps {
  color: string;
  size: number;
}

// Every card gets its size and the user's @name.
export interface CardBaseProps {
  size: number;
  username: string;
}

export interface WorkoutCardProps extends CardBaseProps {
  workout: WorkoutCardData;
}

export interface StreakCardProps extends CardBaseProps {
  weeks: number;
}

export interface ShareRecord {
  kind: RecordKind;
  value: number;
  name: string;
}

export interface PrCardProps extends CardBaseProps {
  record: ShareRecord;
}

export interface BodyCardProps extends CardBaseProps {
  muscles: Map<string, string>;
  days: StripDay[];
  times: number;
}

export interface ExercisesCardProps extends WorkoutCardProps {
  muscles: Map<string, string>;
}

export interface RadarCardProps extends WorkoutCardProps {
  parts: Record<BodyPart, number>;
}

export interface WeightCardProps extends WorkoutCardProps {
  comparison: WeightComparison;
}

// A small label + value block (Summary and Radar cards).
export interface CardStatProps {
  label: string;
  value: string;
  medal?: boolean;
  big?: boolean;
}

// The first exercises a card has room for, and how many are left out.
export interface ExerciseLines<T> {
  shown: T[];
  more: number;
}
