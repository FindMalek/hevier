import { memo, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { scale } from '@/lib/chartScale';
import { COLORS, FONT_SIZES, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { PROGRESS_CHART_SIZES } from '@/constants/sizes';
import { PROGRESS_CHART_LIMITS } from '@/constants/limits';
import type { PlotProps, ProgressChartProps } from './types';

// The line chart on the routine page: one dot per workout, evenly spaced;
// the value range padded by 10% above and below; grid lines at "nice" steps.


// Memoized; a tap only redraws the selected dot, the rest of the chart is kept.
export const ProgressChart = memo(function ProgressChart({
  points,
  formatTick,
  selected,
  onSelect,
}: ProgressChartProps) {
  const [width, setWidth] = useState(0);
  const right = width - PROGRESS_CHART_SIZES.rightGap;
  const { min, max, ticks, step } = useMemo(() => scale(points.map((p) => p.value)), [points]);
  const x = (i: number) => (points.length > 1 ? PROGRESS_CHART_SIZES.left + ((right - PROGRESS_CHART_SIZES.left) * i) / (points.length - 1) : (PROGRESS_CHART_SIZES.left + right) / 2);
  const y = (v: number) => PROGRESS_CHART_SIZES.plotHeight - ((v - min) / (max - min)) * PROGRESS_CHART_SIZES.plotHeight;

  function select(e: GestureResponderEvent) {
    if (points.length === 0) return;
    const i = points.length > 1 ? Math.round(((e.nativeEvent.locationX - PROGRESS_CHART_SIZES.left) / (right - PROGRESS_CHART_SIZES.left)) * (points.length - 1)) : 0;
    onSelect(Math.max(0, Math.min(points.length - 1, i)));
  }

  return (
    <Pressable style={styles.chart} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} onPress={select}>
      {width > 0 && (
        <>
          <Plot points={points} width={width} min={min} max={max} ticks={ticks} step={step} formatTick={formatTick} />
          {/* The selected dot, bigger, over its small one. */}
          {selected >= 0 && selected < points.length && (
            <Svg width={width} height={PROGRESS_CHART_SIZES.plotHeight + 1} style={StyleSheet.absoluteFill} pointerEvents="none">
              <Circle cx={x(selected)} cy={y(points[selected].value)} r={4} fill={COLORS.primary} />
            </Svg>
          )}
        </>
      )}
    </Pressable>
  );
});

// Everything but the selected dot: grid, axes, line, dots and labels.
const Plot = memo(function Plot({
  points,
  width,
  min,
  max,
  ticks,
  step,
  formatTick,
}: PlotProps) {
  const right = width - PROGRESS_CHART_SIZES.rightGap;
  const x = (i: number) => (points.length > 1 ? PROGRESS_CHART_SIZES.left + ((right - PROGRESS_CHART_SIZES.left) * i) / (points.length - 1) : (PROGRESS_CHART_SIZES.left + right) / 2);
  const y = (v: number) => PROGRESS_CHART_SIZES.plotHeight - ((v - min) / (max - min)) * PROGRESS_CHART_SIZES.plotHeight;
  const labelEvery = Math.ceil(points.length / PROGRESS_CHART_LIMITS.maxXLabels);
  return (
    <>
      <Svg width={width} height={PROGRESS_CHART_SIZES.plotHeight + 1} style={StyleSheet.absoluteFill}>
        {ticks.map((t) => (
          <Line key={t} x1={PROGRESS_CHART_SIZES.left} x2={right} y1={y(t)} y2={y(t)} stroke={COLORS.chartGrid} strokeWidth={StyleSheet.hairlineWidth} />
        ))}
        <Line x1={PROGRESS_CHART_SIZES.left} x2={PROGRESS_CHART_SIZES.left} y1={0} y2={PROGRESS_CHART_SIZES.plotHeight} stroke={COLORS.track} strokeWidth={StyleSheet.hairlineWidth} />
        <Line x1={PROGRESS_CHART_SIZES.left} x2={right} y1={PROGRESS_CHART_SIZES.plotHeight} y2={PROGRESS_CHART_SIZES.plotHeight} stroke={COLORS.track} strokeWidth={StyleSheet.hairlineWidth} />
        <Polyline
          points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
          fill="none"
          stroke={COLORS.primary}
          strokeWidth={1.9}
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <Circle key={i} cx={x(i)} cy={y(p.value)} r={2.7} fill={COLORS.primary} />
        ))}
      </Svg>
      {ticks.map((t) => (
        <Text key={t} style={[styles.tick, styles.yTick, { top: y(t) - 7 }]}>
          {formatTick(t, step)}
        </Text>
      ))}
      {points.map((p, i) =>
        (points.length - 1 - i) % labelEvery === 0 ? (
          <Text key={i} style={[styles.tick, styles.xTick, { left: x(i) - 30 }]}>
            {p.label}
          </Text>
        ) : null
      )}
    </>
  );
});

const styles = StyleSheet.create({
  chart: {
    height: PROGRESS_CHART_SIZES.plotHeight + PROGRESS_CHART_SIZES.xLabelGap + 14,
  },
  tick: {
    position: 'absolute',
    ...TYPE.tick,
    lineHeight: LINE_HEIGHTS.tight,
    color: COLORS.textSecondary,
  },
  yTick: {
    fontSize: FONT_SIZES.micro,
    left: 0,
    width: PROGRESS_CHART_SIZES.labelRight,
    textAlign: 'right',
  },
  xTick: {
    top: PROGRESS_CHART_SIZES.plotHeight + PROGRESS_CHART_SIZES.xLabelGap - 2,
    width: PROGRESS_CHART_SIZES.xTickWidth,
    textAlign: 'center',
  },
});
