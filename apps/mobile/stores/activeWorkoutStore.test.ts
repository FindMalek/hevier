import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { WorkoutSettings } from '@/types/workoutSettings';
import type { ActiveWorkout } from '@/types/workout';

// The store with its database, settings and chime replaced by fakes.
const db = vi.hoisted(() => ({
  stored: null as ActiveWorkout | null,
  saves: [] as (ActiveWorkout | null)[],
  loads: 0,
  loadDelay: 0,
  settings: null as WorkoutSettings | null,
  records: 0,
  celebrated: 0,
}));

vi.mock('@/db/activeWorkout/draft', () => ({
  loadActiveWorkout: async () => {
    db.loads++;
    await new Promise((r) => setTimeout(r, db.loadDelay));
    return db.stored && structuredClone(db.stored);
  },
  saveActiveWorkout: async (w: ActiveWorkout) => {
    db.saves.push(structuredClone(w));
  },
  clearActiveWorkout: async () => {
    db.saves.push(null);
  },
}));
vi.mock('@/db/activeWorkout/start', () => ({
  startWorkout: async () => workout(),
}));
vi.mock('@/db/workoutSettings', () => {
  const DEFAULT_WORKOUT_SETTINGS = {
    defaultRestSeconds: null,
    keepAwake: false,
    repsLeft: true,
    inlineTimer: true,
    prAlert: true,
  };
  return {
    DEFAULT_WORKOUT_SETTINGS,
    getWorkoutSettings: async () => db.settings ?? DEFAULT_WORKOUT_SETTINGS,
    restOf: (rest: number | null, s: WorkoutSettings) => rest ?? s.defaultRestSeconds,
  };
});
vi.mock('@/lib/stats/records', () => ({
  setRecords: () => (db.records ? [{ kind: 'weight' }] : []),
}));
vi.mock('@/lib/prFeedback', () => ({
  celebratePr: () => {
    db.celebrated++;
  },
}));
vi.mock('@/lib/workoutMedia', () => ({ deleteMediaFiles: () => {} }));

function workout(over: Partial<ActiveWorkout> = {}): ActiveWorkout {
  return {
    title: 'LOWER A',
    routineId: null,
    startTime: '2026-10-23T10:00:00.000Z',
    restEndsAt: null,
    restTotal: null,
    exercises: [
      {
        key: 'e1',
        exerciseId: 'squat',
        catalogueId: null,
        name: 'Squat',
        type: 'weight_reps',
        notes: '',
        restSeconds: 120,
        previous: [],
        sets: [
          { key: 's1', setType: 'normal', weight: '100', reps: '5', km: '', time: '', done: false },
          { key: 's2', setType: 'normal', weight: '', reps: '', km: '', time: '00:30', done: false },
        ],
        bests: null,
      },
    ],
    ...over,
  };
}

// A fresh store per test: it keeps its state in the module.
async function store(stored: ActiveWorkout | null = workout()) {
  vi.resetModules();
  db.stored = stored;
  db.saves = [];
  db.loads = 0;
  db.loadDelay = 0;
  db.settings = null;
  db.records = 0;
  db.celebrated = 0;
  return import('./activeWorkoutStore');
}

const flush = () => new Promise((r) => setTimeout(r, 5));

describe('activeWorkoutStore', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads once for callers at the same time', async () => {
    const s = await store();
    db.loadDelay = 5;
    const [a, b] = await Promise.all([s.getActiveWorkout(), s.getActiveWorkout()]);
    expect(db.loads).toBe(1);
    expect(a).toBe(b);
  });

  it('keeps a change made before the draft has loaded', async () => {
    const s = await store();
    s.setRest(5000, 60);
    expect(s.peekActiveWorkout()).toBeNull();
    await s.getActiveWorkout();
    await flush();
    expect(s.peekActiveWorkout()?.restEndsAt).toBe(5000);
    expect(db.saves.at(-1)?.restEndsAt).toBe(5000);
  });

  it('writes only the latest state when changes come faster than writes', async () => {
    const s = await store();
    await s.getActiveWorkout();
    for (const title of ['A', 'AB', 'ABC', 'ABCD']) s.updateActiveWorkout((w) => ({ ...w, title }));
    await flush();
    expect(db.saves.map((w) => w?.title)).toEqual(['ABCD']);
    s.updateActiveWorkout((w) => ({ ...w, title: 'X' }));
    s.endActiveWorkout();
    await flush();
    expect(db.saves.at(-1)).toBeNull();
  });

  it('✓ waits for the settings: no rest when the rest timer is off', async () => {
    const s = await store();
    db.settings = { defaultRestSeconds: null, keepAwake: false, repsLeft: true, inlineTimer: true, prAlert: true };
    const w = workout();
    w.exercises[0].restSeconds = null;
    db.stored = w;
    await s.toggleSetDone('e1', 's1');
    const after = s.peekActiveWorkout()!;
    expect(after.exercises[0].sets[0].done).toBe(true);
    expect(after.restEndsAt).toBeNull();
    await s.toggleSetDone('e1', 's1');
    expect(s.peekActiveWorkout()!.exercises[0].sets[0].done).toBe(false);
  });

  it('✓ starts the rest, but not on a workout logged for a past day', async () => {
    let s = await store();
    await s.toggleSetDone('e1', 's1');
    expect(s.peekActiveWorkout()!.restTotal).toBe(120);
    s = await store(workout({ backdated: true }));
    await s.toggleSetDone('e1', 's1');
    expect(s.peekActiveWorkout()!.restEndsAt).toBeNull();
  });

  it('a record celebrates (and toasts) only with PR alerts on', async () => {
    let s = await store();
    db.records = 1;
    const toasts: string[] = [];
    s.onPr((pr) => toasts.push(pr.name));
    await s.toggleSetDone('e1', 's1');
    expect(db.celebrated).toBe(1);
    expect(toasts).toEqual(['Squat']);
    s = await store();
    db.records = 1;
    db.settings = { defaultRestSeconds: null, keepAwake: false, repsLeft: true, inlineTimer: true, prAlert: false };
    await s.toggleSetDone('e1', 's1');
    expect(db.celebrated).toBe(0);
  });

  it('the ▶ timer completes its set at zero without any screen open', async () => {
    const s = await store();
    await s.getActiveWorkout();
    vi.useFakeTimers();
    s.updateActiveWorkout((w) => ({ ...w, setTimer: { setKey: 's2', endsAt: Date.now() + 30_000 } }));
    await vi.advanceTimersByTimeAsync(29_000);
    expect(s.peekActiveWorkout()!.exercises[0].sets[1].done).toBe(false);
    await vi.advanceTimersByTimeAsync(1_100);
    const w = s.peekActiveWorkout()!;
    expect(w.setTimer).toBeNull();
    expect(w.exercises[0].sets[1].done).toBe(true);
    expect(w.restTotal).toBe(120);
  });

  it('a stopped ▶ timer does nothing', async () => {
    const s = await store();
    await s.getActiveWorkout();
    vi.useFakeTimers();
    s.updateActiveWorkout((w) => ({ ...w, setTimer: { setKey: 's2', endsAt: Date.now() + 1_000 } }));
    s.updateActiveWorkout((w) => ({ ...w, setTimer: null }));
    await vi.advanceTimersByTimeAsync(2_000);
    expect(s.peekActiveWorkout()!.exercises[0].sets[1].done).toBe(false);
  });

  it('a ▶ timer that ran out while the app was closed completes on load', async () => {
    const s = await store(workout({ setTimer: { setKey: 's2', endsAt: Date.now() - 1_000 } }));
    await s.getActiveWorkout();
    await flush();
    expect(s.peekActiveWorkout()!.exercises[0].sets[1].done).toBe(true);
  });
});
