import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProgressChart } from '@/components/charts/ProgressChart';
import { ChartHeader, SESSION_SUMMARY_STYLES } from '@/components/charts/ChartHeader';
import { MetricPills } from '@/components/ui/MetricPills';
import { CHART_DEFAULTS } from '@/constants/defaults';
import { CHART_METRIC_LABELS } from '@/constants/labels';
import { LAYOUT, SPACE } from '@/constants/layout';
import { PERIODS } from '@/constants/periods';
import { ROUTINE_METRICS } from '@/constants/routine';
import { ROUTINE_PAGE_SIZES } from '@/constants/sizes';
import { monthDay, shortDate } from '@/lib/format/date';
import { headline, metricValue, tick } from '@/lib/stats/routineMetrics';
import { inPeriod, periodIndex } from '@/lib/training/periods';
import type { RoutineMetric } from '@/types/routine';
import type { RoutineChartProps } from './types';

const METRIC_OPTIONS = ROUTINE_METRICS.map((key) => ({ key, label: CHART_METRIC_LABELS[key] }));

// The routine's progress: the picked workout's value and date over a line
// chart, a range button and Volume / Reps / Duration pills.
export function RoutineChart({ sessions: all }: RoutineChartProps) {
  const [range, setRange] = useState(() => periodIndex(CHART_DEFAULTS.routinePeriod));
  const [metric, setMetric] = useState<RoutineMetric>(CHART_DEFAULTS.routineMetric);
  const [selected, setSelected] = useState<number | null>(null);
  // A new range starts with no bar picked.
  const pickRange = useCallback((i: number) => {
    setRange(i);
    setSelected(null);
  }, []);

  // Memoized: a tap on the chart only moves the selection.
  const sessions = useMemo(() => inPeriod(all, PERIODS[range].days), [all, range]);
  const points = useMemo(
    () => sessions.map((s) => ({ label: monthDay(new Date(s.startTime)), value: metricValue(s, metric) })),
    [sessions, metric]
  );
  const formatTick = useCallback((v: number) => tick(v, metric), [metric]);
  const shown = selected !== null && selected < sessions.length ? selected : sessions.length - 1;

  return (
    <>
      <ChartHeader ranges={PERIODS} range={range} onRange={pickRange}>
        {shown >= 0 ? (
          <>
            <Text style={SESSION_SUMMARY_STYLES.value}>{headline(sessions[shown], metric)} </Text>
            <Text style={SESSION_SUMMARY_STYLES.date}>{shortDate(new Date(sessions[shown].startTime))}</Text>
          </>
        ) : (
          <Text style={SESSION_SUMMARY_STYLES.empty}>No workouts yet</Text>
        )}
      </ChartHeader>

      <View style={styles.chart}>
        {points.length > 0 && <ProgressChart points={points} formatTick={formatTick} selected={shown} onSelect={setSelected} />}
      </View>

      <MetricPills options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
    </>
  );
}

const styles = StyleSheet.create({
  // Full screen width: the chart measures its own axes from the screen edge.
  chart: {
    marginTop: SPACE.xl,
    marginHorizontal: -LAYOUT.screenMargin,
    minHeight: ROUTINE_PAGE_SIZES.chartMinHeight,
  },
});
