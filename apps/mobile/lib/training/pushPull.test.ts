import { describe, expect, it, vi } from 'vitest';

vi.mock('@/db/client', () => ({ getDb: async () => null }));
vi.mock('expo-crypto', () => ({ randomUUID: () => 'id' }));
const { balanceLabel, balanceWarning, pushPull, pushPullSide } = await import('./pushPull');
const { HEVY_CATALOGUE_MAP } = await import('@/scripts/import/hevyCatalogueMap');
type StatSet = import('@/types/stats').StatSet;

const set = (day: number, name: string): StatSet => ({
  workoutId: `w${day}`,
  title: 'UPPER',
  startTime: new Date(2026, 9, day, 18).toISOString(),
  durationSeconds: 3600,
  exerciseId: name,
  name,
  catalogueId: null,
  primary: 'Chest',
  secondary: [],
  weightKg: 100,
  reps: 5,
});

describe('push / pull', () => {
  it("puts each of the user's exercises on the right side", () => {
    const sides: Record<string, string[]> = { push: [], pull: [], armPush: [], armPull: [], none: [] };
    for (const name of Object.keys(HEVY_CATALOGUE_MAP)) sides[pushPullSide(name) ?? 'none'].push(name);
    expect(sides.push.sort()).toEqual([
      'Bench Press (Dumbbell)',
      'Chest Dip',
      'Chest Fly (Machine)',
      'Front Raise (Dumbbell)',
      'Incline Bench Press (Dumbbell)',
      'Incline Chest Press (Machine)',
      'Iso-Lateral Chest Press (Machine)',
      'Push Up',
      'Shoulder Press (Dumbbell)',
    ]);
    expect(sides.pull.sort()).toEqual([
      'Chest Supported Y Raise (Dumbbell)',
      'Chin Up',
      'Face Pull',
      'Iso-Lateral Low Row',
      'Lat Pulldown (Cable)',
      'Lat Pulldown - Close Grip (Cable)',
      'Pull Up',
      'Rear Delt Reverse Fly (Dumbbell)',
      'Rear Delt Reverse Fly (Machine)',
      'Seated Cable Row - Bar Wide Grip',
      'Seated Cable Row - V Grip (Cable)',
      'Single Arm Cable Row',
      'Straight Arm Lat Pulldown (Cable)',
    ]);
    expect(sides.armPush.sort()).toEqual(['Triceps Dip', 'Triceps Extension (Dumbbell)', 'Triceps Pushdown']);
    expect(sides.armPull.sort()).toEqual([
      'Bicep Curl (Dumbbell)',
      'Hammer Curl (Cable)',
      'Hammer Curl (Dumbbell)',
      'Preacher Curl (Barbell)',
      'Seated Incline Curl (Dumbbell)',
    ]);
    expect(sides.none).toEqual(expect.arrayContaining(['Lateral Raise (Dumbbell)', 'Lying Leg Curl (Machine)', 'Seated Palms Up Wrist Curl', 'Leg Press (Machine)']));
  });

  it('counts one per set, per week, arms apart', () => {
    const sets = [
      set(6, 'Bench Press (Dumbbell)'),
      set(6, 'Shoulder Press (Dumbbell)'),
      set(6, 'Lat Pulldown (Cable)'),
      set(6, 'Face Pull'),
      set(6, 'Triceps Pushdown'),
      set(13, 'Bicep Curl (Dumbbell)'),
      set(13, 'Leg Press (Machine)'),
      set(25, 'Bench Press (Dumbbell)'), // after the period
    ];
    expect(pushPull(sets, new Date(2026, 9, 5), new Date(2026, 9, 19))).toEqual({ push: 1, pull: 1, armPush: 0.5, armPull: 0.5 });
  });

  it('1 bench + 1 row is Balanced, warns only past the usual range', () => {
    expect(balanceLabel(5, 5)).toBe('Balanced');
    expect(balanceLabel(5, 7)).toBe('A bit more pull');
    expect(balanceLabel(7, 5)).toBe('More push');
    expect(balanceLabel(8, 5)).toBe('Much more push');
    expect(balanceLabel(3, 7)).toBe('Much more pull');
    expect(balanceLabel(1, 1)).toBe('Not enough sets');
    expect(balanceWarning(5, 7)).toBeNull();
    expect(balanceWarning(7, 5)).toBeNull();
    expect(balanceWarning(1, 0)).toBeNull();
    expect(balanceWarning(8, 5)).toMatch(/^Push is 1\.6× pull\./);
    expect(balanceWarning(3, 7)).toMatch(/^Pull is 2\.3× push\./);
    expect(balanceWarning(4, 0)).toMatch(/^Push is far above pull\./);
  });
});
