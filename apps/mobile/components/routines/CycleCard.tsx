import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ArrowsClockwise } from 'phosphor-react-native/src/icons/ArrowsClockwise';
import { Play } from 'phosphor-react-native/src/icons/Play';
import { SkipForward } from 'phosphor-react-native/src/icons/SkipForward';

import { COLORS, LINE_HEIGHTS, TYPE, withAlpha } from '@/constants/theme';
import { timeAgo } from '@/lib/format/feed';
import { BORDER_WIDTHS, LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { CYCLE_CARD_SIZES, ICON_SIZES, SIZES } from '@/constants/sizes';
import { CYCLE_CARD_MOTION } from '@/constants/motion';
import type { CycleCardProps } from './types';

// Top of Home: the cycle's next routine (db/rotation/cycle.ts).
// A step bar shows where this lap stands; the next step breathes 3 times when
// Home comes into view (or after a skip), then rests: a looping animation
// redraws every frame and kept the app at ~30% of a core on an idle Home.
export const CycleCard = memo(function CycleCard({
  cycle,
  now,
  onOpen,
  onStart,
  onSkip,
}: CycleCardProps) {
  const next = cycle.routines[cycle.next];
  return (
    <Animated.View entering={FadeInDown.duration(CYCLE_CARD_MOTION.enterMs)} style={styles.wrap}>
      <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => onOpen(next.id)}>
        <View style={styles.topRow}>
          <ArrowsClockwise size={ICON_SIZES.xs} weight="bold" color={COLORS.primary} />
          <Text style={styles.kicker}>NEXT IN CYCLE</Text>
          <Text style={styles.count}>
            {cycle.next + 1} of {cycle.routines.length}
          </Text>
        </View>

        {/* Keyed by routine: a skip slides the new name in. */}
        <Animated.Text key={next.id} entering={FadeInRight.duration(CYCLE_CARD_MOTION.nameEnterMs)} style={styles.name} numberOfLines={1}>
          {next.name}
        </Animated.Text>
        {cycle.nextExercises.length > 0 && (
          <Text style={[TYPE.body, styles.exercises]} numberOfLines={2}>
            {cycle.nextExercises.join(', ')}
          </Text>
        )}

        <View style={styles.steps}>
          {cycle.routines.map((r, i) => (
            <View key={r.id} style={styles.step}>
              {i === cycle.next ? <PulseBar /> : <View style={[styles.bar, i < cycle.next && styles.barDone]} />}
              <Text style={[styles.stepName, i === cycle.next && styles.stepNameNext]} numberOfLines={1}>
                {r.name}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.last}>
          {cycle.last ? `Last: ${cycle.last.title} · ${timeAgo(cycle.last.startTime, new Date(now))}` : 'First session of the cycle'}
        </Text>

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.start, pressed && styles.buttonPressed]}
            onPress={() => onStart(next.id)}>
            <Play size={ICON_SIZES.sm} weight="fill" color={COLORS.text} />
            <Text style={[TYPE.bodyMedium, styles.buttonLabel]}>Start Workout</Text>
          </Pressable>
          {cycle.routines.length > 1 && (
            <Pressable style={({ pressed }) => [styles.button, styles.skip, pressed && styles.buttonPressed]} onPress={onSkip}>
              <SkipForward size={ICON_SIZES.sm} weight="fill" color={COLORS.text} />
              <Text style={[TYPE.bodyMedium, styles.buttonLabel]}>Skip</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

function PulseBar() {
  const glow = useSharedValue(1);
  useFocusEffect(
    useCallback(() => {
      glow.set(withRepeat(withTiming(CYCLE_CARD_MOTION.glowDimOpacity, { duration: CYCLE_CARD_MOTION.glowMs, easing: Easing.inOut(Easing.quad) }), CYCLE_CARD_MOTION.glowHalfBreaths, true));
      return () => {
        cancelAnimation(glow);
        glow.set(1);
      };
    }, [glow])
  );
  const style = useAnimatedStyle(() => ({ opacity: glow.get() }));
  return <Animated.View style={[styles.bar, styles.barDone, style]} />;
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: LAYOUT.screenMargin,
    marginTop: SPACE.sm,
    marginBottom: SPACE.lg,
  },
  card: {
    padding: LAYOUT.cardPadding,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: withAlpha(COLORS.primary, 0.35),
  },
  pressed: {
    opacity: 0.85,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kicker: {
    flex: 1,
    marginLeft: SPACE.xs,
    ...TYPE.xsSemibold,
    letterSpacing: 0.8,
    color: COLORS.primary,
  },
  count: {
    ...TYPE.captionMedium,
    color: COLORS.textSecondary,
  },
  name: {
    marginTop: SPACE.sm,
    ...TYPE.displaySemibold,
  },
  exercises: {
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.normal,
    marginTop: SPACE.xxs,
  },
  steps: {
    flexDirection: 'row',
    gap: SPACE.xs,
    marginTop: SPACE.lg,
  },
  step: {
    flex: 1,
  },
  bar: {
    height: CYCLE_CARD_SIZES.barHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.track, // steps still to come; separator grey is too faint on a card
  },
  barDone: {
    backgroundColor: COLORS.primary,
  },
  stepName: {
    marginTop: SPACE.xs,
    ...TYPE.miniMedium,
    color: COLORS.textSecondary,
  },
  stepNameNext: {
    color: COLORS.text,
  },
  last: {
    marginTop: SPACE.md,
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: SPACE.sm,
    marginTop: SPACE.md,
  },
  button: {
    height: SIZES.buttonHeight,
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  start: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  skip: {
    paddingHorizontal: SPACE.lg,
    backgroundColor: COLORS.track,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  buttonLabel: {
    marginLeft: SPACE.sm,
  },
});
