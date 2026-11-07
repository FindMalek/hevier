import { describe, expect, it } from 'vitest';
import { dayLabel, durationLabel, timeAgo } from './feed';

describe('workout card labels', () => {
  it("formats durations: '1h 9min'", () => {
    expect(durationLabel(4140)).toBe('1h 9min');
    expect(durationLabel(2700)).toBe('45min');
  });

  it('says when', () => {
    const now = new Date(2026, 9, 13, 22, 0);
    expect(timeAgo(new Date(2026, 9, 13, 19, 0).toISOString(), now)).toBe('3 hours ago');
    expect(dayLabel(new Date(2026, 9, 13, 19, 0).toISOString(), now)).toBe('Today');
    expect(dayLabel(new Date(2026, 9, 12, 19, 0).toISOString(), now)).toBe('Yesterday');
    expect(dayLabel(new Date(2026, 9, 6, 19, 0).toISOString(), now)).toBe('Oct 6');
    expect(dayLabel(new Date(2025, 9, 6, 19, 0).toISOString(), now)).toBe('Oct 6, 2025');
  });
});
