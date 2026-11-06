import { memo, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { CONFETTI_COLORS } from '@/constants/theme';
import { RADIUS } from '@/constants/layout';
import { CONFETTI_LIMITS } from '@/constants/limits';
import { CONFETTI_MOTION } from '@/constants/motion';
import type { ConfettiPieceProps, Piece } from './types';

const COLORS = CONFETTI_COLORS;

function makePieces(screenWidth: number): Piece[] {
  return Array.from({ length: CONFETTI_LIMITS.pieces }, (_, i) => ({
    x: Math.random() * screenWidth,
    drift: (Math.random() - 0.5) * CONFETTI_MOTION.driftPx,
    width: CONFETTI_MOTION.widthMinPx + Math.random() * CONFETTI_MOTION.widthExtraPx,
    height: CONFETTI_MOTION.heightMinPx + Math.random() * CONFETTI_MOTION.heightExtraPx,
    color: COLORS[i % COLORS.length],
    delay: Math.random() * CONFETTI_MOTION.delayMaxMs,
    duration: CONFETTI_MOTION.fallMinMs + Math.random() * CONFETTI_MOTION.fallExtraMs,
    spin: (Math.random() < 0.5 ? -1 : 1) * (CONFETTI_MOTION.spinMinDeg + Math.random() * CONFETTI_MOTION.spinExtraDeg),
  }));
}

// All pieces run off one clock (ms since the start) instead of a timing each:
// a piece waits its delay, then falls over its duration, eased in (Easing.in(quad)).
const ConfettiPiece = memo(function ConfettiPiece({ piece, fall, clock }: ConfettiPieceProps) {
  const style = useAnimatedStyle(() => {
    const linear = Math.min(1, Math.max(0, (clock.get() - piece.delay) / piece.duration));
    const p = linear * linear;
    return {
      opacity: p === 0 ? 0 : 1 - Math.max(0, (p - 0.8) / 0.2),
      transform: [
        { translateX: piece.x + piece.drift * p },
        { translateY: -30 + fall * p },
        { rotate: `${piece.spin * p}deg` },
        { rotateX: `${piece.spin * 0.6 * p}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.piece, { width: piece.width, height: piece.height, backgroundColor: piece.color }, style]}
    />
  );
});

// A one-off shower of paper falling over the whole screen, played on mount.
// The pieces mount two frames later, so the screen under them draws first.
export function Confetti() {
  const { width, height } = useWindowDimensions();
  const [pieces] = useState(() => makePieces(width));
  const [ready, setReady] = useState(false);
  const clock = useSharedValue(0);

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const end = Math.max(...pieces.map((p) => p.delay + p.duration));
    clock.set(withTiming(end, { duration: end, easing: Easing.linear }));
  }, [ready, pieces, clock]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {ready && pieces.map((p, i) => <ConfettiPiece key={i} piece={p} fall={height + 60} clock={clock} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: RADIUS.xs,
  },
});
