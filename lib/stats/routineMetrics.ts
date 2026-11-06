import { volumeLabel } from '@/lib/format/weight';
import type { RoutineMetric, RoutineSession } from '@/types/routine';

// The routine page's chart: what each metric plots, its headline and its axis ticks.

// The plotted value: minutes for duration, so the grid lands on whole minutes.
export function metricValue(s: RoutineSession, metric: RoutineMetric): number {
  if (metric === 'volume') return s.volumeKg;
  if (metric === 'reps') return s.reps;
  return s.durationSeconds / 60;
}

// Over the chart: "8,025 kg", "96 reps", "1h 12min".
export function headline(s: RoutineSession, metric: RoutineMetric): string {
  if (metric === 'volume') return volumeLabel(s.volumeKg);
  if (metric === 'reps') return `${s.reps} reps`;
  const minutes = Math.round(s.durationSeconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min`;
}

// The axis: "5,000 kg", "80 reps", "60 min".
export function tick(v: number, metric: RoutineMetric): string {
  if (metric === 'volume') return volumeLabel(v);
  if (metric === 'reps') return `${Math.round(v)} reps`;
  return `${Math.round(v)} min`;
}

// A planned set's number, or "-" when left empty.
export function plannedNumber(v: number | null): string {
  return v === null ? '-' : String(v);
}
