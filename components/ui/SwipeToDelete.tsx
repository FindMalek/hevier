import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { SWIPE_TO_DELETE_SIZES } from '@/constants/sizes';
import { SWIPE_TO_DELETE_MOTION } from '@/constants/motion';
import { swipeSettle } from '@/lib/swipeToDelete';
import type { SwipeToDeleteProps } from './types';

// Swipe left to delete a set row: the row slides
// over a red "Delete". Released part-way it stays open (tap Delete); swiped
// past half the screen it deletes straight away. The row follows the finger
// on the UI thread: the JS thread is only called when the row is deleted.

export function SwipeToDelete({
  onDelete,
  rowStyle,
  children,
}: SwipeToDeleteProps) {
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const startX = useSharedValue(0);
  const swiping = useSharedValue(false);
  const latestOnDelete = useRef(onDelete);
  useEffect(() => {
    latestOnDelete.current = onDelete;
  });
  const deleted = useCallback(() => latestOnDelete.current(), []);

  const swipe = useMemo(
    () =>
      Gesture.Pan()
        // Only clearly sideways drags; vertical ones keep scrolling the page.
        .activeOffsetX([-SWIPE_TO_DELETE_SIZES.activateX, SWIPE_TO_DELETE_SIZES.activateX])
        .failOffsetY([-SWIPE_TO_DELETE_SIZES.failY, SWIPE_TO_DELETE_SIZES.failY])
        .onStart(() => {
          swiping.set(true);
          startX.set(x.get());
        })
        .onUpdate((e) => {
          x.set(Math.min(0, startX.get() + e.translationX));
        })
        // `deleted` reads the ref only after a swipe ends, never while rendering.
        // eslint-disable-next-line react-hooks/refs
        .onEnd((e) => {
          const to = swipeSettle(startX.get() + e.translationX, width, SWIPE_TO_DELETE_SIZES.open);
          x.set(
            withTiming(to, { duration: SWIPE_TO_DELETE_MOTION.settleMs }, (done) => {
              if (done && to === -width) scheduleOnRN(deleted);
            })
          );
        })
        .onFinalize((_, success) => {
          // Stopped by the system part-way (a call, the page took over): close.
          if (swiping.get() && !success) x.set(withTiming(0, { duration: SWIPE_TO_DELETE_MOTION.settleMs }));
          swiping.set(false);
        }),
    [x, startX, swiping, width, deleted]
  );

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }] }));
  const slideAway = () =>
    x.set(
      withTiming(-width, { duration: SWIPE_TO_DELETE_MOTION.deleteMs }, (done) => {
        if (done) scheduleOnRN(deleted);
      })
    );

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.delete} onPress={slideAway}>
        <Text style={styles.deleteLabel}>Delete</Text>
      </Pressable>
      <GestureDetector gesture={swipe}>
        <Animated.View style={[rowStyle, slide]}>{children}</Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  delete: {
    ...StyleSheet.absoluteFill,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: SPACE.xl,
    backgroundColor: COLORS.danger,
  },
  deleteLabel: {
    ...TYPE.bodyMedium,
  },
});
