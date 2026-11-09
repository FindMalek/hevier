import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { BAR_CHART_SIZES } from '@/constants/sizes';
import { BAR_CHART_LIMITS } from '@/constants/limits';
import type { BarChartProps } from './types';

// The bar chart on the Profile tab: bars from 0 to the tallest one, the y axis
// just right of the widest label, x labels under every other bar. Tapping a
// bar selects it (the others dim); tapping it again clears the selection.

// Memoized: the Profile header redraws on a pill or range change, not on every scroll.
export const BarChart = memo(function BarChart({
  values,
  labels,
  max,
  ticks,
  formatTick,
  selected,
  onSelect,
}: BarChartProps) {
  const [width, setWidth] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);
  const left = BAR_CHART_SIZES.labelLeft + labelWidth + BAR_CHART_SIZES.axisGap;
  const right = width - BAR_CHART_SIZES.rightGap;
  const slot = (right - left) / Math.max(values.length, 1);
  const y = (v: number) => BAR_CHART_SIZES.plotHeight - (v / max) * BAR_CHART_SIZES.plotHeight;
  const labelEvery = Math.ceil(values.length / BAR_CHART_LIMITS.maxXLabels);
  const ready = width > 0 && labelWidth > 0;

  function select(e: GestureResponderEvent) {
    if (!ready || values.length === 0) return;
    const i = Math.max(0, Math.min(values.length - 1, Math.floor((e.nativeEvent.locationX - left) / slot)));
    onSelect(i === selected ? null : i);
  }

  return (
    <Pressable style={styles.chart} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} onPress={select}>
      {/* Laid out once, unseen, to find the widest y label. */}
      <View style={styles.measure} onLayout={(e) => setLabelWidth(e.nativeEvent.layout.width)}>
        {ticks.map((t) => (
          <Text key={t} style={[styles.tick, styles.measureText]}>
            {formatTick(t)}
          </Text>
        ))}
      </View>
      {ready && (
        <>
          <Svg width={width} height={BAR_CHART_SIZES.plotHeight + 1} style={StyleSheet.absoluteFill}>
            {ticks
              .filter((t) => t > 0)
              .map((t) => (
                <Line key={t} x1={left} x2={right} y1={y(t)} y2={y(t)} stroke={COLORS.chartGrid} strokeWidth={StyleSheet.hairlineWidth} />
              ))}
            {values.map((v, i) =>
              v > 0 ? (
                <Rect
                  key={i}
                  x={left + slot * i + (slot * (1 - BAR_CHART_SIZES.barShare)) / 2}
                  y={y(v)}
                  width={slot * BAR_CHART_SIZES.barShare}
                  height={BAR_CHART_SIZES.plotHeight - y(v)}
                  fill={COLORS.primary}
                  fillOpacity={selected === null || selected === i ? 1 : 0.4}
                />
              ) : null
            )}
            <Line x1={left} x2={left} y1={0} y2={BAR_CHART_SIZES.plotHeight} stroke={COLORS.track} strokeWidth={StyleSheet.hairlineWidth} />
            <Line x1={left} x2={right} y1={BAR_CHART_SIZES.plotHeight} y2={BAR_CHART_SIZES.plotHeight} stroke={COLORS.track} strokeWidth={StyleSheet.hairlineWidth} />
          </Svg>
          {ticks.map((t) => (
            <Text key={t} style={[styles.tick, styles.yTick, { top: y(t) - 7, width: left - BAR_CHART_SIZES.axisGap }]}>
              {formatTick(t)}
            </Text>
          ))}
          {labels.map((label, i) =>
            i % labelEvery === 0 ? (
              <Text key={i} style={[styles.tick, styles.xTick, { left: left + slot * (i + 0.5) - 30 }]}>
                {label}
              </Text>
            ) : null
          )}
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  chart: {
    height: BAR_CHART_SIZES.plotHeight + BAR_CHART_SIZES.xLabelGap + 14,
  },
  tick: {
    position: 'absolute',
    ...TYPE.tick,
    lineHeight: LINE_HEIGHTS.tight,
    color: COLORS.textSecondary,
  },
  measure: {
    position: 'absolute',
    opacity: 0,
    alignItems: 'flex-start',
  },
  measureText: {
    position: 'relative',
  },
  yTick: {
    left: 0,
    textAlign: 'right',
  },
  xTick: {
    top: BAR_CHART_SIZES.plotHeight + BAR_CHART_SIZES.xLabelGap - 2,
    width: BAR_CHART_SIZES.xTickWidth,
    textAlign: 'center',
  },
});
