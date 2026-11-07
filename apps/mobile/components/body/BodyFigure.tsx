import { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { MuscleMapBody } from './MuscleMapBody';
import { BODY_MAP_COLORS, COLORS, TYPE, ZONE_COLORS } from '@/constants/theme';
import { zoneOf } from '@/lib/training/effort';
import { ZONES } from '@/constants/training';
import { RECOVERY_LABELS } from '@/constants/labels';
import { RADIUS, SPACE } from '@/constants/layout';
import { BODY_FIGURE_SIZES } from '@/constants/sizes';
import { MUSCLE_MAP_GROUPS } from '@/constants/muscles';
import type { MuscleGroup } from '@/types/muscles';
import type { RecoveryState } from '@/types/stats';
import type { BodyFigureProps, LegendItem, LegendProps } from './types';

// Front and back bodies for the Statistics body graph and heat map (drawn by
// MuscleMapBody), each muscle in the colour its view gives it, with a legend.
// Two views: hard sets against weekly zones, and recovery right now
// (lib/training/effort.ts).

const BASE = BODY_MAP_COLORS.base; // nothing to show

// A view's colours (muscle → colour) on MuscleMap's groups.
export function groupColors(shades: Map<MuscleGroup, string>): Map<string, string> {
  const colorOf = new Map<string, string>();
  for (const [muscle, color] of shades) for (const g of MUSCLE_MAP_GROUPS[muscle] ?? []) colorOf.set(g, color);
  return colorOf;
}

// --- Hard sets: weekly target zones ----------------------------------------


export function volumeView(hard: Map<MuscleGroup, number>): { shades: Map<MuscleGroup, string>; legend: LegendItem[] } {
  const shades = new Map<MuscleGroup, string>();
  for (const [muscle, n] of hard) {
    const zone = zoneOf(n);
    if (zone > 0) shades.set(muscle, ZONE_COLORS[zone - 1]);
  }
  // Highest zone on top.
  const legend = ZONES.map((z, i) => ({ color: ZONE_COLORS[i], label: z.label, range: z.range })).reverse();
  return { shades, legend };
}

export function zoneColor(hard: number): string {
  const zone = zoneOf(hard);
  return zone > 0 ? ZONE_COLORS[zone - 1] : BASE;
}

// --- Recovery ----------------------------------------------------------------

// Traffic lights: what can be trained today.
export const RECOVERY_COLORS: Record<RecoveryState, string> = {
  ready: COLORS.success,
  recovering: COLORS.caution,
  fatigued: COLORS.danger,
};

export function recoveryView(states: Map<MuscleGroup, RecoveryState>): {
  shades: Map<MuscleGroup, string>;
  legend: LegendItem[];
} {
  const shades = new Map<MuscleGroup, string>();
  for (const [muscle, state] of states) shades.set(muscle, RECOVERY_COLORS[state]);
  return {
    shades,
    legend: [
      { color: RECOVERY_COLORS.ready, label: RECOVERY_LABELS.ready },
      { color: RECOVERY_COLORS.recovering, label: RECOVERY_LABELS.recovering },
      { color: RECOVERY_COLORS.fatigued, label: RECOVERY_LABELS.fatigued },
    ],
  };
}

export const BodyFigure = memo(function BodyFigure({
  shades,
  legend,
  height = 290,
}: BodyFigureProps) {
  // The same Map while the shades are, so the memoized bodies don't redraw.
  const colorOf = useMemo(() => groupColors(shades), [shades]);
  return (
    <View>
      <MuscleMapBody colorOf={colorOf} height={height} />
      <Legend items={legend} />
    </View>
  );
});

// What each colour means: one row each, name left, range right.
function Legend({ items }: LegendProps) {
  return (
    <View style={styles.legend}>
      {items.map((l) => (
        <View key={l.label} style={styles.legendItem}>
          <View style={[styles.swatch, { backgroundColor: l.color }]} />
          <Text style={styles.legendLabel}>{l.label}</Text>
          {l.range ? <Text style={styles.legendRange}>{l.range}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    width: BODY_FIGURE_SIZES.legendWidth,
    marginTop: SPACE.lg,
    alignSelf: 'center',
    gap: SPACE.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatch: {
    width: BODY_FIGURE_SIZES.swatchWidth,
    height: BODY_FIGURE_SIZES.swatchHeight,
    borderRadius: RADIUS.xs,
  },
  legendLabel: {
    flex: 1,
    marginLeft: SPACE.sm,
    ...TYPE.callout,
  },
  legendRange: {
    ...TYPE.small,
    color: COLORS.textSecondary,
  },
});
