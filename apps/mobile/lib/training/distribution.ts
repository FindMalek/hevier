import { hardSets } from './effort';
import { between } from '@/lib/stats/stats';
import { setVolumeKg } from '@/lib/volume';
import { RADAR_EDGE_SETS, RADAR_RING_STEP, ZONES } from '@/constants/training';
import { weeksBetween } from '@/lib/date';
import { RADAR_MUSCLES } from '@/constants/muscles';
import type { RadarMuscle } from '@/types/muscles';
import type { PeriodLoad, PeriodSummary, StatSet } from '@/types/stats';

// Statistics → Muscle distribution (Chart): hard sets per week (secondary
// muscles at half, as the body map) for each muscle on its own axis, on a fixed scale with rings at the zone limits.


export function periodLoad(sets: StatSet[], weights: number[], from: Date, to: Date): PeriodLoad {
  const weeks = weeksBetween(from, to);
  const hard = hardSets(sets, weights, from, to);
  const perWeek = {} as Record<RadarMuscle, number>;
  let total = 0;
  for (const m of RADAR_MUSCLES) {
    const n = hard.get(m) ?? 0;
    perWeek[m] = n / weeks;
    total += n;
  }
  return { perWeek, total };
}

// The zone limits as rings (3 and 4 a week). The outer edge is RADAR_EDGE_SETS,
// pushed out in RADAR_RING_STEP steps only when a muscle goes past it.
export const RINGS = ZONES.slice(1).map((z) => z.from);

export function radarScale(...loads: PeriodLoad[]): number {
  const top = Math.max(0, ...loads.flatMap((l) => Object.values(l.perWeek)));
  return Math.max(RADAR_EDGE_SETS, Math.ceil(top / RADAR_RING_STEP) * RADAR_RING_STEP);
}

// --- The cards under the radar ---

export function periodSummary(sets: StatSet[], from: Date, to: Date): PeriodSummary {
  const inPeriod = between(sets, from, to);
  const durations = new Map<string, number>();
  let volumeKg = 0;
  for (const s of inPeriod) {
    durations.set(s.workoutId, s.durationSeconds);
    volumeKg += setVolumeKg(s.weightKg, s.reps, s.bodyWeightKg);
  }
  let durationSeconds = 0;
  for (const d of durations.values()) durationSeconds += d;
  return { workouts: durations.size, durationSeconds, volumeKg, sets: inPeriod.length };
}

export function setsPerWorkout(summary: PeriodSummary): number {
  return summary.workouts ? summary.sets / summary.workouts : 0;
}

