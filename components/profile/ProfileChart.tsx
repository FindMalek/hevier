import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BarChart } from '@/components/charts/BarChart';
import { ChartHeader } from '@/components/charts/ChartHeader';
import { MetricPills } from '@/components/ui/MetricPills';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { CHART_DEFAULTS } from '@/constants/defaults';
import { CHART_METRIC_LABELS } from '@/constants/labels';
import { LAYOUT, SPACE } from '@/constants/layout';
import { PROFILE_METRICS, PROFILE_RANGES } from '@/constants/profile';
import { barLabel, barScale, bars, headline, periodLabel, tickLabel } from '@/lib/stats/profileCharts';
import type { ProfileMetric } from '@/types/profile';
import type { ProfileChartProps } from './types';

const METRIC_OPTIONS = PROFILE_METRICS.map((key) => ({ key, label: CHART_METRIC_LABELS[key] }));

// The Profile chart: this week's (or month's) total over bars per day / week /
// month, a range button and Duration / Volume / Reps pills.
export function ProfileChart({ sessions, now }: ProfileChartProps) {
  const [metric, setMetric] = useState<ProfileMetric>(CHART_DEFAULTS.profileMetric);
  const [range, setRange] = useState(() => PROFILE_RANGES.findIndex((r) => r.label === CHART_DEFAULTS.profilePeriod));
  // The tapped bar; null shows this week (or month).
  const [selected, setSelected] = useState<number | null>(null);
  // A new range starts with no bar picked.
  const pickRange = useCallback((i: number) => {
    setRange(i);
    setSelected(null);
  }, []);

  // All memoized: a bar tap used to recompute every bar.
  const r = PROFILE_RANGES[range];
  const chart = useMemo(() => bars(sessions, r, metric, new Date(now)), [sessions, r, metric, now]);
  const values = useMemo(() => chart.map((b) => b.value), [chart]);
  const { max, step, ticks } = useMemo(() => barScale(values), [values]);
  const labels = useMemo(() => {
    const spansYears = chart.length > 0 && chart[0].start.getFullYear() !== chart[chart.length - 1].start.getFullYear();
    return chart.map((b) => barLabel(b.start, r.unit, spansYears));
  }, [chart, r]);
  const formatTick = useCallback((t: number) => tickLabel(t, step, metric), [step, metric]);
  const shown = selected !== null && selected < chart.length ? chart[selected] : null;
  const current = shown ? shown.value : chart.length ? chart[chart.length - 1].value : 0;

  return (
    <>
      <ChartHeader ranges={PROFILE_RANGES} range={range} onRange={pickRange}>
        <Text style={styles.summaryValue}>{headline(current, metric)}</Text>
        {shown ? (
          <Text style={styles.summaryPeriod}> {periodLabel(shown.start, r.unit)}</Text>
        ) : (
          <Text style={styles.summaryWhen}>{r.unit === 'day' ? ' today' : ` this ${r.unit}`}</Text>
        )}
      </ChartHeader>

      <View style={styles.chart}>
        <BarChart
          values={values}
          labels={labels}
          max={max}
          ticks={ticks}
          formatTick={formatTick}
          selected={shown ? selected : null}
          onSelect={setSelected}
        />
      </View>

      <MetricPills options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
    </>
  );
}

const styles = StyleSheet.create({
  summaryValue: {
    ...TYPE.titleSemibold,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  summaryWhen: {
    ...TYPE.title,
    lineHeight: LINE_HEIGHTS.relaxed,
    color: COLORS.textSecondary,
  },
  // The tapped bar's dates, blue like the routine page's date.
  summaryPeriod: {
    ...TYPE.title,
    lineHeight: LINE_HEIGHTS.relaxed,
    color: COLORS.primary,
  },
  // Full screen width: the chart measures its own axes from the screen edge.
  chart: {
    marginTop: SPACE.lg,
    marginHorizontal: -LAYOUT.screenMargin,
  },
});
