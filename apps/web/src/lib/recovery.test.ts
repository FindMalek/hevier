import { describe, expect, it } from 'vitest';
import { SESSIONS, recoveryState, recoveryWindow, summarize } from './recovery';

describe('recoveryWindow', () => {
  it('follows the table in docs/science/recovery.md', () => {
    expect(recoveryWindow(0.5)).toBeNull();
    expect(recoveryWindow(1)).toEqual({ heavyUntil: 12, partlyUntil: 30 });
    expect(recoveryWindow(2.5)).toEqual({ heavyUntil: 24, partlyUntil: 48 });
    expect(recoveryWindow(3.5)).toEqual({ heavyUntil: 24, partlyUntil: 72 });
  });
});

describe('recoveryState', () => {
  it('goes heavy, partly, ready as hours pass', () => {
    expect(recoveryState(4, 23)).toBe('heavy');
    expect(recoveryState(4, 24)).toBe('partly');
    expect(recoveryState(4, 71)).toBe('partly');
    expect(recoveryState(4, 72)).toBe('ready');
  });

  it('keeps untrained muscles idle and drops green after a week', () => {
    expect(recoveryState(0.5, 5)).toBe('idle');
    expect(recoveryState(4, 24 * 7 + 1)).toBe('idle');
  });
});

describe('summarize', () => {
  it('splits a leg day into states 30 hours later', () => {
    const legs = SESSIONS.find((s) => s.id === 'legs');
    if (!legs) throw new Error('missing legs session');
    const out = summarize(legs, 30);
    expect(out.partly).toContain('QUADS');
    expect(out.ready).toContain('ADDUCTORS');
    expect(out.heavy).toHaveLength(0);
  });
});
