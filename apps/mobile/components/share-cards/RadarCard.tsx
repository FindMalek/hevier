import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path } from 'react-native-svg';

import { COLORS, SHARE_COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES, SHARE_CARDS_SIZES } from '@/constants/sizes';
import { BODY_PARTS } from '@/constants/muscles';
import { durationLabel } from '@/lib/format/feed';
import { volumeLabel } from '@/lib/format/weight';
import { Medal } from '@/components/workout/PrToast';
import { ShareCard } from './ShareCard';
import { radarPoint, wedgePath } from './shareCardMaths';
import { shared } from './styles';
import type { CardStatProps, RadarCardProps } from './types';

function RadarStat({ label, value, medal }: CardStatProps) {
  return (
    <View style={styles.radarStat}>
      <Text style={styles.radarStatLabel}>{label}</Text>
      <View style={shared.statRow}>
        <Text style={styles.radarStatValue}>{value}</Text>
        {medal && <Medal size={ICON_SIZES.lg} />}
      </View>
    </View>
  );
}

// The radar card: Duration / Volume / Records, then a wedge per body part
// (clockwise from Chest on the right), its length = its sets against the most.
export const RadarCard = memo(function RadarCard({ size, username, workout, parts }: RadarCardProps) {
  const chart = size * 0.58;
  const c = chart / 2;
  const axis = size * 0.21;
  const most = Math.max(1, ...BODY_PARTS.map((p) => parts[p]));
  return (
    <ShareCard size={size} username={username}>
      <View style={styles.radarStats}>
        <RadarStat label="Duration" value={durationLabel(workout.durationSeconds)} />
        <RadarStat label="Volume" value={volumeLabel(workout.volumeKg)} />
        <RadarStat label="Records" value={String(workout.records)} medal={workout.records > 0} />
      </View>
      <View style={[styles.radar, { width: chart, height: chart }]}>
        <Svg width={chart} height={chart}>
          {BODY_PARTS.map((_, i) => {
            const [x, y] = radarPoint(c, i * 60, axis);
            return <Line key={i} x1={c} y1={c} x2={x} y2={y} stroke={SHARE_COLORS.radarAxis} strokeWidth={1} />;
          })}
          {BODY_PARTS.map((part, i) => {
            if (parts[part] === 0) return null;
            const r = axis * 0.95 * (parts[part] / most);
            return (
              <Path
                key={part}
                d={wedgePath(c, i * 60, r, SHARE_CARDS_SIZES.radarHalfWedge)}
                fill={SHARE_COLORS.radarFill}
                stroke={COLORS.primary}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            );
          })}
        </Svg>
        {BODY_PARTS.map((part, i) => {
          const [x, y] = radarPoint(c, i * 60, axis + (i % 3 === 0 ? 46 : 24));
          return (
            <Text key={part} style={[styles.radarLabel, { left: x - 50, top: y - 10 }]}>
              {part}
            </Text>
          );
        })}
      </View>
    </ShareCard>
  );
});

const styles = StyleSheet.create({
  radarStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  radarStat: {
    alignItems: 'center',
  },
  radarStatLabel: {
    ...TYPE.callout,
  },
  radarStatValue: {
    ...TYPE.titleBold,
  },
  radar: {
    marginTop: SPACE.sm,
    alignSelf: 'center',
  },
  radarLabel: {
    position: 'absolute',
    width: SHARE_CARDS_SIZES.radarLabelWidth,
    textAlign: 'center',
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
});
