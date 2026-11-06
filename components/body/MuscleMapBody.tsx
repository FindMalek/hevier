import { memo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, G, Image, LinearGradient, Path, Stop } from 'react-native-svg';
import { MALE_BACK, MALE_FRONT } from '@musclemap/assets';
import { COLORS, withAlpha } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { MUSCLE_MAP_BODY_SIZES } from '@/constants/sizes';
import type { MuscleMapBodyProps, SideProps } from './types';

// Front and back muscular bodies from MuscleMap's traced path data
// (@musclemap/assets, MIT, https://github.com/Jsplice/MuscleMap): their body
// picture with coloured muscles painted on.
// Each muscle is authored once on the left and mirrored.

// Their body pictures turned grey (their colours would read as data).
const PHOTOS = {
  FRONT: require('@/assets/images/musclemap-male-front.webp'),
  BACK: require('@/assets/images/musclemap-male-back.webp'),
};

const STROKE = withAlpha(COLORS.black, 0.55);

// Lighter at the top, darker at the bottom: a little roundness.
function shade(hex: string, amount: number): string {
  const v = hex.replace('#', '');
  const target = amount < 0 ? 0 : 255;
  const mix = (i: number) => {
    const c = parseInt(v.slice(i, i + 2), 16);
    return Math.round(c + (target - c) * Math.abs(amount))
      .toString(16)
      .padStart(2, '0');
  };
  return `#${mix(0)}${mix(2)}${mix(4)}`;
}

// Memoized: hundreds of paths, redrawn only when the colours or the size change.
const Side = memo(function Side({
  diagram,
  colorOf,
  height,
}: SideProps) {
  const mirror = `matrix(-1 0 0 1 ${2 * diagram.centerX} 0)`;
  const colors = [...new Set(diagram.muscles.map((m) => colorOf.get(m.group)).filter((c): c is string => !!c))];
  const both = (side: string, el: (key: string, transform?: string) => ReactNode, key: string) =>
    side === 'LEFT' ? [el(key), el(`${key}-r`, mirror)] : [el(key)];
  return (
    <Svg width={(height * MUSCLE_MAP_BODY_SIZES.crop.w) / MUSCLE_MAP_BODY_SIZES.crop.h} height={height} viewBox={`${MUSCLE_MAP_BODY_SIZES.crop.x} ${MUSCLE_MAP_BODY_SIZES.crop.y} ${MUSCLE_MAP_BODY_SIZES.crop.w} ${MUSCLE_MAP_BODY_SIZES.crop.h}`}>
      <Defs>
        {colors.map((c, i) => (
          <LinearGradient key={c} id={`${diagram.id}-g${i}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={shade(c, 0.2)} />
            <Stop offset="0.55" stopColor={c} />
            <Stop offset="1" stopColor={shade(c, -0.25)} />
          </LinearGradient>
        ))}
        <ClipPath id={`${diagram.id}-clip`}>
          {diagram.outline.flatMap((o) => both(o.side, (key, t) => <Path key={key} d={o.d} transform={t} />, o.id))}
        </ClipPath>
      </Defs>
      <Image
        href={PHOTOS[diagram.view]}
        x={0}
        y={0}
        width={1024}
        height={1536}
        preserveAspectRatio="none"
        clipPath={`url(#${diagram.id}-clip)`}
      />
      {/* Untrained muscles stay the grey picture. */}
      <G>
        {diagram.muscles.flatMap((m, i) => {
          const color = colorOf.get(m.group);
          if (!color) return [];
          const fill = `url(#${diagram.id}-g${colors.indexOf(color)})`;
          return both(
            m.side,
            (key, t) => <Path key={key} d={m.d} fill={fill} opacity={0.85} stroke={STROKE} strokeWidth={1.2} transform={t} />,
            `${m.group}-${i}`
          );
        })}
      </G>
    </Svg>
  );
});

// colorOf: MuscleMap group (e.g. "QUADS") → colour.
// vertical: front above back (the "Nice work!" exercises card).
export const MuscleMapBody = memo(function MuscleMapBody({
  colorOf,
  height,
  vertical,
}: MuscleMapBodyProps) {
  return (
    <View style={vertical ? styles.vertical : styles.row}>
      <Side diagram={MALE_FRONT} colorOf={colorOf} height={height} />
      <Side diagram={MALE_BACK} colorOf={colorOf} height={height} />
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACE.xl,
  },
  vertical: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: SPACE.md,
  },
});
