import { PERIODS } from '@/constants/periods';
import type { Period } from '@/types/stats';

export function periodIndex(label: Period['label']): number {
  return PERIODS.findIndex((p) => p.label === label);
}

// Midnight starting the period: `days` days with today the last one.
export function periodStart(days: number, now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1 - days);
}

export function inPeriod<T extends { startTime: string }>(sessions: T[], days: number | null, now = new Date()): T[] {
  if (days === null) return sessions;
  const since = periodStart(days, now).getTime();
  return sessions.filter((s) => Date.parse(s.startTime) >= since);
}
