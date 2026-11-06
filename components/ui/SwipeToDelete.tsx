import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { SWIPE_TO_DELETE_SIZES } from '@/constants/sizes';
import { SWIPE_TO_DELETE_MOTION } from '@/constants/motion';
import type { SwipeToDeleteProps } from './types';

// Swipe left to delete a set row: the row slides
// over a red "Delete". Released part-way it stays open (tap Delete); swiped
// past half the screen it deletes straight away.

export function SwipeToDelete({
  onDelete,
  rowStyle,
  children,
}: SwipeToDeleteProps) {
  const { width } = useWindowDimensions();
  const [x] = useState(() => new Animated.Value(0));
  const latest = useRef({ onDelete, width });
  useEffect(() => {
    latest.current = { onDelete, width };
  });

  // The callbacks read `latest` and the offset only during a gesture, never while rendering.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => {
    let start = 0;
    let offset = 0;
    x.addListener(({ value }) => (offset = value));
    const settle = (to: number, then?: () => void) =>
      Animated.timing(x, { toValue: to, duration: SWIPE_TO_DELETE_MOTION.settleMs, useNativeDriver: true }).start(() => then?.());
    return PanResponder.create({
      // Only clearly sideways drags; vertical ones keep scrolling the page.
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        start = offset;
      },
      onPanResponderMove: (_, g) => x.setValue(Math.min(0, start + g.dx)),
      onPanResponderRelease: (_, g) => {
        const end = start + g.dx;
        const { width: w, onDelete: del } = latest.current;
        if (end < -w / 2) settle(-w, del);
        else if (end < -SWIPE_TO_DELETE_SIZES.open / 2) settle(-SWIPE_TO_DELETE_SIZES.open);
        else settle(0);
      },
      onPanResponderTerminate: () => settle(0),
    });
  });

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.delete}
        onPress={() => Animated.timing(x, { toValue: -width, duration: SWIPE_TO_DELETE_MOTION.deleteMs, useNativeDriver: true }).start(() => onDelete())}>
        <Text style={styles.deleteLabel}>Delete</Text>
      </Pressable>
      <Animated.View style={[rowStyle, { transform: [{ translateX: x }] }]} {...responder.panHandlers}>
        {children}
      </Animated.View>
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
