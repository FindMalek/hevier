import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

import { SHARE_COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import type { ShareCardProps, StripesProps } from './types';

// The "Nice work!" cards after Save: square dark-navy cards swiped one by
// one, with the "Hevier" wordmark and the user's @name at the bottom.
// The cards are memoized: a swipe only moves the page dots.

// Faint rounded stripes across the top-right corner.
function Stripes({ color, size }: StripesProps) {
  const lines = [
    [0.52, -0.05, 0.12, 0.35],
    [0.68, -0.05, 0.3, 0.33],
    [0.84, -0.05, 0.6, 0.19],
    [1.05, 0.02, 0.62, 0.45],
    [1.05, 0.22, 0.75, 0.52],
    [1.05, 0.38, 0.88, 0.55],
  ];
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
      {lines.map(([x1, y1, x2, y2], i) => (
        <Line
          key={i}
          x1={x1 * size}
          y1={y1 * size}
          x2={x2 * size}
          y2={y2 * size}
          stroke={color}
          strokeWidth={size * 0.055}
          strokeLinecap="round"
        />
      ))}
    </Svg>
  );
}

export function Wordmark() {
  return <Text style={styles.wordmark}>HEVIER</Text>;
}

export function ShareCard({ size, username, stripes, centered, footer = !centered, children }: ShareCardProps) {
  return (
    <View style={[styles.card, { width: size, height: size }]}>
      {stripes && <Stripes color={stripes === 'streak' ? SHARE_COLORS.streakStripe : SHARE_COLORS.prStripe} size={size} />}
      <View style={[styles.body, centered && styles.bodyCentered]}>{children}</View>
      {footer && (
        <View style={styles.footer}>
          <Wordmark />
          <Text style={styles.username}>@{username}</Text>
        </View>
      )}
    </View>
  );
}

// Measured on nice-work-*.jpg (2.625 px/dp); the card is 378 dp there.
const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: SHARE_COLORS.cardBorder,
    backgroundColor: SHARE_COLORS.cardBg,
    overflow: 'hidden',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACE.xl,
  },
  bodyCentered: {
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACE.xl,
    paddingBottom: SPACE.xl,
  },
  wordmark: {
    ...TYPE.headlineBold,
    letterSpacing: 1,
  },
  username: {
    ...TYPE.titleMedium,
  },
});
