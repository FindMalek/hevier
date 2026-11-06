import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { Warning } from 'phosphor-react-native/src/icons/Warning';

import { InnerHeader } from '@/components/ui/InnerHeader';
import { Screen } from '@/components/ui/Screen';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import { EmptyState } from '@/components/ui/EmptyState';
import { RangeSheet } from '@/components/charts/RangeSheet';
import { RadarChart } from '@/components/stats/RadarChart';
import { StatCard } from '@/components/stats/StatCard';
import { PushPullCard } from '@/components/stats/PushPullCard';
import { DistributionInfoSheet } from '@/components/stats/DistributionInfoSheet';
import { COLORS, DISTRIBUTION_COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { CHART_DEFAULTS } from '@/constants/defaults';
import { BORDER_WIDTHS, HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, STATISTICS_DISTRIBUTION_SIZES } from '@/constants/sizes';
import { PERIODS } from '@/constants/periods';
import { getStatSets } from '@/db/stats/statSets';
import { periodLoad, periodSummary, radarScale, setsPerWorkout } from '@/lib/training/distribution';
import { effortWeights } from '@/lib/training/effort';
import { balanceWarning, pushPull } from '@/lib/training/pushPull';
import { periods } from '@/lib/stats/stats';
import { durationLabel } from '@/lib/format/feed';
import { shortVolumeLabel } from '@/lib/format/weight';
import type { RadarMuscle } from '@/types/muscles';
import type { Period, StatSet } from '@/types/stats';

// Statistics → Muscle distribution (Chart) (lib/training/distribution.ts): one axis per muscle, hard sets per week on a
// fixed scale whose edge is RADAR_EDGE_SETS (constants/training.ts), a web of rings every 2 sets,
// this period filled blue over the one before as a dashed grey outline. No
// shading, and plain numbers, no percentages. Under it four cards: Workouts,
// Duration, Volume and
// Sets, each with the change from the period before.
// The shared periods (lib/training/periods.ts) but All time: there is no period before it.
const RANGES = PERIODS.filter((p): p is Extract<Period, { days: number }> => p.days !== null);

export default function DistributionScreen() {
  const { width } = useWindowDimensions();
  const [sets, setSets] = useState<StatSet[] | null>(null);
  const [range, setRange] = useState(() => RANGES.findIndex((p) => p.label === CHART_DEFAULTS.distributionPeriod));
  const [rangeSheet, setRangeSheet] = useState(false);
  const [info, setInfo] = useState(false);
  // A muscle tapped on the radar: its numbers show under the chart.
  const [selected, setSelected] = useState<RadarMuscle | null>(null);

  useFocusEffect(
    useCallback(() => {
      getStatSets().then(setSets);
    }, [])
  );

  const r = RANGES[range];
  const weights = useMemo(() => (sets ? effortWeights(sets) : []), [sets]);
  // Memoized: tapping a muscle on the radar used to redo every pass over the sets.
  const { now, before, scale, summary, summaryBefore, push, pull, armPush, armPull, warning } = useMemo(() => {
    const all = sets ?? [];
    const { current, previous } = periods(r.days);
    const now = periodLoad(all, weights, ...current);
    const before = periodLoad(all, weights, ...previous);
    const balance = pushPull(all, ...current);
    return {
      now,
      before,
      scale: radarScale(now, before),
      summary: periodSummary(all, ...current),
      summaryBefore: periodSummary(all, ...previous),
      ...balance,
      warning: balanceWarning(balance.push, balance.pull),
    };
  }, [sets, weights, r.days]);

  const empty = sets !== null && now.total === 0 && before.total === 0;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader
        title="Muscle Distribution"
        right={
          // Grey ? (what's counted).
          <Pressable style={styles.help} onPress={() => setInfo(true)} hitSlop={HIT_SLOPS.lg}>
            <Text style={styles.helpText}>?</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={SCREEN_STYLES.content}>
        {/* Full-width period button. */}
        <Pressable style={({ pressed }) => [styles.range, pressed && styles.pressed]} onPress={() => setRangeSheet(true)}>
          <Text style={styles.rangeText}>{r.label}</Text>
          <CaretDown size={ICON_SIZES.sm} weight="bold" color={COLORS.text} />
        </Pressable>

        {empty ? (
          <EmptyState message="No workouts in this period" style={styles.empty} />
        ) : (
          <RadarChart width={width} now={now} before={before} scale={scale} selected={selected} onSelect={setSelected} />
        )}

        {sets && (
          <View style={styles.cards}>
            <StatCard title="Workouts" value={String(summary.workouts)} change={summary.workouts - summaryBefore.workouts} format={String} />
            <StatCard
              title="Duration"
              value={durationLabel(summary.durationSeconds)}
              change={summary.durationSeconds - summaryBefore.durationSeconds}
              format={durationLabel}
            />
            <StatCard
              title="Volume"
              value={shortVolumeLabel(summary.volumeKg)}
              change={summary.volumeKg - summaryBefore.volumeKg}
              format={shortVolumeLabel}
            />
            {/* Every logged set, warm-ups included, unlike the radar's hard sets. */}
            <StatCard title="Sets (all)" value={String(summary.sets)} change={summary.sets - summaryBefore.sets} format={String} />
            {/* In a card: what explains a change in sets, and the
                push / pull balance (information, never a target). */}
            <StatCard
              title="Sets per workout"
              value={String(Math.round(setsPerWorkout(summary)))}
              change={Math.round(setsPerWorkout(summary)) - Math.round(setsPerWorkout(summaryBefore))}
              format={String}
            />
            <PushPullCard push={push} pull={pull} />
          </View>
        )}

        {sets && (
          <View style={styles.notes}>
            {warning && (
              <View style={styles.warning}>
                <Warning size={ICON_SIZES.md} color={DISTRIBUTION_COLORS.warn} weight="fill" />
                <Text style={styles.warningText}>{warning}</Text>
              </View>
            )}
            {armPush + armPull > 0 && (
              <Text style={styles.armsText}>
                Arms, not in Push / Pull: curls {armPull.toFixed(1)} · triceps {armPush.toFixed(1)} sets a week
              </Text>
            )}
          </View>
        )}

      </ScrollView>

      <DistributionInfoSheet visible={info} onDismiss={() => setInfo(false)} />

      <RangeSheet visible={rangeSheet} ranges={RANGES} range={range} onPick={setRange} onDismiss={() => setRangeSheet(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginVertical: 60,
  },
  // Measured on muscle-distribution.jpg: 36 tall, 16 under the header.
  range: {
    height: STATISTICS_DISTRIBUTION_SIZES.rangeHeight,
    marginTop: SPACE.lg,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.sm,
    backgroundColor: COLORS.surface,
  },
  rangeText: {
    ...TYPE.body,
  },
  pressed: {
    opacity: 0.7,
  },
  help: {
    marginRight: SPACE.lg,
    width: STATISTICS_DISTRIBUTION_SIZES.helpWidth,
    height: STATISTICS_DISTRIBUTION_SIZES.helpHeight,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.track,
  },
  helpText: {
    ...TYPE.xsSemibold,
    lineHeight: LINE_HEIGHTS.tight,
  },
  // Measured on muscle-distribution.jpg: two 181×97.5 cards a row, 16 apart,
  // a #2C2C2E border.
  cards: {
    marginTop: SPACE.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACE.lg,
  },
  notes: {
    marginTop: SPACE.lg,
    gap: SPACE.md,
  },
  warning: {
    flexDirection: 'row',
    gap: SPACE.sm,
    padding: SPACE.md,
    borderWidth: BORDER_WIDTHS.hairline,
    borderRadius: RADIUS.xl,
    borderColor: DISTRIBUTION_COLORS.warn,
  },
  warningText: {
    flex: 1,
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.normal,
  },
  armsText: {
    ...TYPE.caption,
    lineHeight: LINE_HEIGHTS.snug,
    color: COLORS.textSecondary,
  },
});
