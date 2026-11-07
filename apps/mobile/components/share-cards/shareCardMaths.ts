import { clock } from '@/lib/format/duration';
import { round2 } from '@/lib/format/weight';
import type { RecordKind } from '@/types/records';
import type { ExerciseLines } from './types';

// "148.15 kg", "12 reps", "01:30", "5.2 km".
export function recordValue(kind: RecordKind, value: number): string {
  if (kind === 'reps') return `${value} reps`;
  if (kind === 'duration') return clock(value);
  if (kind === 'distance') return `${round2(value)} km`;
  return `${round2(value)} kg`;
}

// The first `max` exercises, and how many more ("...and 2 more exercises").
export function exerciseLines<T>(exercises: T[], max: number): ExerciseLines<T> {
  const shown = exercises.slice(0, max);
  return { shown, more: exercises.length - shown.length };
}

// The point `r` away from the centre (c, c) at `deg` degrees (0 = right, clockwise).
export function radarPoint(c: number, deg: number, r: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [c + r * Math.cos(a), c + r * Math.sin(a)];
}

// A pie wedge from the centre, `halfWedge` degrees each side of `deg`.
export function wedgePath(c: number, deg: number, r: number, halfWedge: number): string {
  const [x1, y1] = radarPoint(c, deg - halfWedge, r);
  const [x2, y2] = radarPoint(c, deg + halfWedge, r);
  return `M ${c} ${c} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
}
