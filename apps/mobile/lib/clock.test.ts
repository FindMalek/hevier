import { describe, expect, it } from 'vitest';

import {
  adjustTimer,
  initialClock,
  pauseTimer,
  pauseWatch,
  resetTimer,
  resetWatch,
  startTimer,
  startWatch,
  timerLeft,
  watchElapsed,
} from './clock';
import { timerLabel, watchLabel } from '@/lib/format/duration';

describe('clock', () => {
  it('starts at 01:00 and counts down; pause keeps what is left', () => {
    let s = initialClock;
    expect(timerLabel(timerLeft(s, 0))).toBe('01:00');
    s = startTimer(s, 1000);
    expect(timerLabel(timerLeft(s, 21_000))).toBe('00:40');
    s = pauseTimer(s, 21_000);
    expect(timerLabel(timerLeft(s, 99_000))).toBe('00:40');
    s = startTimer(s, 100_000);
    expect(timerLeft(s, 140_000)).toBe(0);
    expect(timerLabel(timerLeft(resetTimer(s), 0))).toBe('01:00');
  });

  it('-15s / +15s change the setting when idle (not below 15s) and the countdown when running', () => {
    let s = adjustTimer(initialClock, 15, 0);
    expect(s.timerSeconds).toBe(75);
    s = adjustTimer(adjustTimer(adjustTimer(adjustTimer(s, -15, 0), -15, 0), -15, 0), -15, 0);
    expect(s.timerSeconds).toBe(15);
    s = startTimer({ ...s, timerSeconds: 60 }, 0);
    s = adjustTimer(s, 15, 10_000);
    expect(timerLabel(timerLeft(s, 10_000))).toBe('01:05');
    s = adjustTimer(s, -120, 10_000);
    expect(timerLeft(s, 10_000)).toBe(0);
  });

  it('stopwatch runs, pauses, resumes and resets', () => {
    let s = startWatch(initialClock, 5_000);
    expect(watchLabel(watchElapsed(s, 65_000))).toBe('00:01:00');
    s = pauseWatch(s, 65_000);
    s = startWatch(s, 100_000);
    // 60s so far, resumed at 100s: one hour at 3,640s.
    expect(watchLabel(watchElapsed(s, 3_640_000))).toBe('01:00:00');
    expect(watchLabel(watchElapsed(resetWatch(s), 0))).toBe('00:00:00');
  });

  it('shows hours on long timers and rounds seconds up', () => {
    expect(timerLabel(3_900_000)).toBe('1:05:00');
    expect(timerLabel(400)).toBe('00:01');
  });
});
