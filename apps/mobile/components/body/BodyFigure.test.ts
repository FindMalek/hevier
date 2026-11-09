import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ StyleSheet: { create: (s: unknown) => s }, View: 'View', Text: 'Text' }));
vi.mock('./MuscleMapBody', () => ({ MuscleMapBody: 'MuscleMapBody' }));
vi.mock('@/db/client', () => ({ getDb: async () => null }));
vi.mock('@/lib/training/effort', async () => await import('@/lib/training/effort'));
const { RECOVERY_COLORS, groupColors, recoveryView, volumeView, zoneColor } = await import('./BodyFigure');

describe('body figure', () => {
  it('sets: shaded by weekly zone, lats and upper back apart', () => {
    const { shades, legend } = volumeView(
      new Map([
        ['Chest', 12],
        ['Triceps', 3],
        ['Lats', 1],
        ['Upper Back', 11],
        ['Biceps', 0],
      ])
    );
    const colorOf = groupColors(shades);
    expect(colorOf.get('CHEST')).toBe('#0A66FF'); // Growth
    expect(colorOf.get('TRICEPS')).toBe('#4DA8FF'); // Maintenance
    expect(colorOf.get('LATS')).toBe('#B8DCFF'); // Below maintenance
    expect(colorOf.get('RHOMBOIDS')).toBe('#0A66FF');
    expect(colorOf.has('BICEPS')).toBe(false); // none: the grey picture shows
    expect(legend.map((l) => l.label)).toEqual(['Growth', 'Maintenance', 'Below maintenance']);
    expect(zoneColor(25)).toBe('#0A66FF');
  });

  it('outer thigh: shows the quads unless abductors were trained', () => {
    const quadsOnly = groupColors(volumeView(new Map([['Quadriceps', 6]])).shades);
    expect(quadsOnly.get('ABDUCTORS')).toBe('#0A66FF');
    const both = groupColors(volumeView(new Map([['Quadriceps', 6], ['Abductors', 1]])).shades);
    expect(both.get('ABDUCTORS')).toBe('#B8DCFF');
  });

  it('recovery: traffic lights; one muscle can light several groups', () => {
    const colorOf = groupColors(
      recoveryView(
        new Map([
          ['Shoulders', 'fatigued'],
          ['Abdominals', 'recovering'],
          ['Neck', 'ready'], // MuscleMap has no neck
        ])
      ).shades
    );
    expect(['SHOULDERS_FRONT', 'SHOULDERS_SIDE', 'SHOULDERS_REAR'].map((g) => colorOf.get(g))).toEqual(
      Array(3).fill(RECOVERY_COLORS.fatigued)
    );
    expect(colorOf.get('OBLIQUES')).toBe(RECOVERY_COLORS.recovering);
    expect(colorOf.size).toBe(5);
  });
});
