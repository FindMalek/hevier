import { describe, expect, it } from 'vitest';
import type { RoutineSession } from '@/types/routine';
import { headline, metricValue, plannedNumber, tick } from './routineMetrics';

const s: RoutineSession = { startTime: '2026-10-23T21:42:05Z', volumeKg: 8025, reps: 96, durationSeconds: 4320 };

describe('routine metrics', () => {
  it('plots volume, reps, and duration in minutes', () => {
    expect([metricValue(s, 'volume'), metricValue(s, 'reps'), metricValue(s, 'duration')]).toEqual([8025, 96, 72]);
  });

  it('writes the headline', () => {
    expect(headline(s, 'volume')).toBe('8,025 kg');
    expect(headline(s, 'reps')).toBe('96 reps');
    expect(headline(s, 'duration')).toBe('1h 12min');
    expect(headline({ ...s, durationSeconds: 2700 }, 'duration')).toBe('45min');
  });

  it('writes the ticks', () => {
    expect(tick(79.6, 'reps')).toBe('80 reps');
    expect(tick(60, 'duration')).toBe('60 min');
  });

  it('shows an empty planned value as a dash', () => {
    expect([plannedNumber(null), plannedNumber(0), plannedNumber(12.5)]).toEqual(['-', '0', '12.5']);
  });
});
