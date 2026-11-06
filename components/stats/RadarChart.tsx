import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';

import { COLORS, DISTRIBUTION_COLORS, FONTS, FONT_SIZES, TYPE } from '@/constants/theme';
import { RADAR_MUSCLES } from '@/constants/muscles';
import { RADAR_MUSCLE_LABELS } from '@/constants/labels';
import { RADIUS, SPACE } from '@/constants/layout';
import { STATISTICS_DISTRIBUTION_SIZES } from '@/constants/sizes';
import { labelAnchor, labelDy, radarLayout, radarPoint, radarPolygon, ringValues, spokeAngle } from './radarGeometry';
import type { RadarChartProps } from './types';

// The Muscle distribution radar: hard sets per week per muscle, this period
// filled blue over the one before as a dashed grey outline, on a spider web
// with a ring every 2 sets (no shading, user). Tap a muscle for its numbers.
export function RadarChart({ width, now, before, scale, selected, onSelect }: RadarChartProps) {
  const layout = radarLayout(width);
  const { size, height, cx, cy, radius } = layout;
  const n = RADAR_MUSCLES.length;
  const point = (i: number, value: number) => radarPoint(layout, i, n, value, scale);
  const ring = (value: number) => radarPolygon(layout, RADAR_MUSCLES.map(() => value), scale);
  const nowShape = radarPolygon(layout, RADAR_MUSCLES.map((m) => now.perWeek[m]), scale);
  const beforeShape = radarPolygon(layout, RADAR_MUSCLES.map((m) => before.perWeek[m]), scale);

  return (
    <View style={styles.chart}>
      <Svg width={size} height={height}>
        {ringValues(scale).map((v) => (
          <Polygon key={v} points={ring(v)} fill="none" stroke={COLORS.track} strokeWidth={1} />
        ))}
        {RADAR_MUSCLES.map((m, i) => {
          const [x, y] = point(i, scale);
          const cos = Math.cos(spokeAngle(i, n));
          const sin = Math.sin(spokeAngle(i, n));
          const lx = cx + cos * (radius + STATISTICS_DISTRIBUTION_SIZES.labelGap);
          const ly = cy + sin * (radius + STATISTICS_DISTRIBUTION_SIZES.labelGap);
          const on = selected === m;
          return (
            <G key={m}>
              <Line x1={cx} y1={cy} x2={x} y2={y} stroke={on ? COLORS.primary : COLORS.track} strokeWidth={1} />
              <SvgText
                x={lx}
                y={ly + labelDy(sin)}
                fill={on ? COLORS.primary : COLORS.text}
                fontSize={FONT_SIZES.small}
                fontFamily={FONTS.regular}
                textAnchor={labelAnchor(cos)}>
                {RADAR_MUSCLE_LABELS[m]}
              </SvgText>
            </G>
          );
        })}
        {/* The edge's value under the top spoke. */}
        <SvgText x={cx + 4} y={point(0, scale)[1] + 12} fill={COLORS.textSecondary} fontSize={FONT_SIZES.mini} fontFamily={FONTS.regular}>
          {scale}
        </SvgText>
        <Polygon points={beforeShape} fill="none" stroke={DISTRIBUTION_COLORS.previous} strokeWidth={1.5} strokeDasharray="5,4" />
        <Polygon points={nowShape} fill={COLORS.primary} fillOpacity={0.25} stroke={COLORS.primary} strokeWidth={2} />
        {RADAR_MUSCLES.map((m, i) => {
          const [x, y] = point(i, now.perWeek[m]);
          return <Circle key={m} cx={x} cy={y} r={selected === m ? 5 : 3} fill={COLORS.primary} />;
        })}
        {/* Invisible tap areas over each label and the middle of its spoke. */}
        {RADAR_MUSCLES.map((m, i) => {
          const toggle = () => onSelect(selected === m ? null : m);
          const [lx, ly] = point(i, scale * 1.25);
          const [mx, my] = point(i, scale * 0.55);
          return (
            <G key={m} onPress={toggle}>
              <Circle cx={lx} cy={ly} r={26} fill={COLORS.black} fillOpacity={0.01} />
              <Circle cx={mx} cy={my} r={22} fill={COLORS.black} fillOpacity={0.01} />
            </G>
          );
        })}
      </Svg>
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
        <Text style={styles.legendText}>Current</Text>
        <View style={[styles.dash, styles.dotGap]} />
        <View style={[styles.dash, styles.dashGap]} />
        <Text style={styles.legendText}>Previous</Text>
      </View>
      {selected ? (
        <Text style={styles.picked}>
          {selected} · {now.perWeek[selected].toFixed(1)} sets a week
          <Text style={styles.unit}> · {before.perWeek[selected].toFixed(1)} before</Text>
        </Text>
      ) : (
        <Text style={styles.unit}>sets per week · tap a muscle</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    marginTop: SPACE.sm,
    alignItems: 'center',
  },
  // Small grey key under the radar, toward the right.
  legend: {
    alignSelf: 'flex-end',
    marginRight: SPACE.xxxl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: STATISTICS_DISTRIBUTION_SIZES.dotWidth,
    height: STATISTICS_DISTRIBUTION_SIZES.dotHeight,
    borderRadius: RADIUS.round,
  },
  dash: {
    width: STATISTICS_DISTRIBUTION_SIZES.dashWidth,
    height: STATISTICS_DISTRIBUTION_SIZES.dashHeight,
    backgroundColor: DISTRIBUTION_COLORS.previous,
  },
  dashGap: {
    marginLeft: SPACE.xxs,
  },
  dotGap: {
    marginLeft: SPACE.md,
  },
  legendText: {
    marginLeft: SPACE.xs,
    ...TYPE.xs,
    color: COLORS.textSecondary,
  },
  picked: {
    marginTop: SPACE.md,
    ...TYPE.calloutMedium,
  },
  unit: {
    marginTop: SPACE.md,
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
});
