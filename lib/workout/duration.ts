import { MS_PER_SECOND } from '@/constants/time';

// Length of a workout in whole seconds from its ISO start/end strings.
// No end time (still running, or never recorded) counts as 0, and an end
// before the start is clamped to 0. Unparseable dates give NaN, like Date.parse.
export function durationSecondsOf(startTime: string, endTime: string | null | undefined): number {
  if (!endTime) return 0;
  return Math.max(0, Math.round((Date.parse(endTime) - Date.parse(startTime)) / MS_PER_SECOND));
}
