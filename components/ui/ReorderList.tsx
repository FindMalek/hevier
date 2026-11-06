import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { List } from 'phosphor-react-native/src/icons/List';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, SPACE } from '@/constants/layout';
import { ICON_SIZES, REORDER_LIST_SIZES } from '@/constants/sizes';
import { REORDER_LIST_MOTION } from '@/constants/motion';
import type { DragHandleProps, ReorderListProps } from './types';

// Rows dragged by their ≡ handle (Reorder Folders, Reorder Exercises). Plain
// rows with inset dividers, like the Workout Settings page. The parent owns the order and
// saves it only on Done.

export function ReorderList({
  items,
  onChange,
}: ReorderListProps) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragY] = useState(() => new Animated.Value(0));
  const drag = useRef({ startIndex: 0, index: 0 });

  function startDrag(id: string) {
    const index = items.findIndex((f) => f.id === id);
    drag.current = { startIndex: index, index };
    dragY.setValue(0);
    setDragId(id);
  }

  // The list reorders as the finger passes each row; the dragged row is
  // shifted back by the same amount so it stays under the finger.
  function moveDrag(id: string, dy: number) {
    const { startIndex, index } = drag.current;
    const target = Math.max(0, Math.min(items.length - 1, startIndex + Math.round(dy / REORDER_LIST_SIZES.row)));
    if (target !== index) {
      drag.current.index = target;
      const next = items.filter((f) => f.id !== id);
      next.splice(target, 0, items.find((f) => f.id === id)!);
      onChange(next);
    }
    dragY.setValue(dy - (target - startIndex) * REORDER_LIST_SIZES.row);
  }

  function endDrag() {
    Animated.spring(dragY, { toValue: 0, useNativeDriver: true, ...REORDER_LIST_MOTION.settleSpring }).start(() => setDragId(null));
  }

  return (
    <View>
      {items.map((item, i) => {
        const dragging = item.id === dragId;
        return (
          <Animated.View
            key={item.id}
            style={[styles.row, dragging && styles.rowDragging, dragging && { transform: [{ translateY: dragY }] }]}>
            {i > 0 && !dragging && items[i - 1].id !== dragId && <View style={styles.divider} />}
            {item.left ? <View style={styles.left}>{item.left}</View> : null}
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
            <DragHandle
              onStart={() => startDrag(item.id)}
              onMove={(dy) => moveDrag(item.id, dy)}
              onEnd={endDrag}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

function DragHandle({ onStart, onMove, onEnd }: DragHandleProps) {
  // The responder is made once; it calls whatever handlers the latest render passed.
  const handlers = useRef({ onStart, onMove, onEnd });
  useEffect(() => {
    handlers.current = { onStart, onMove, onEnd };
  });
  // The callbacks read `handlers.current` only when touched, never while rendering.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => handlers.current.onStart(),
      onPanResponderMove: (_, g) => handlers.current.onMove(g.dy),
      onPanResponderRelease: () => handlers.current.onEnd(),
      onPanResponderTerminate: () => handlers.current.onEnd(),
    })
  );
  return (
    <View style={styles.handle} hitSlop={HIT_SLOPS.md} {...responder.panHandlers}>
      <List size={ICON_SIZES.xl} color={COLORS.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: REORDER_LIST_SIZES.row,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACE.lg,
    paddingRight: SPACE.md,
    backgroundColor: COLORS.background,
  },
  rowDragging: {
    zIndex: 1,
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  divider: {
    position: 'absolute',
    top: 0,
    left: REORDER_LIST_SIZES.dividerLeft,
    right: REORDER_LIST_SIZES.dividerRight,
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
  },
  left: {
    marginRight: SPACE.md,
  },
  label: {
    flex: 1,
    ...TYPE.body,
  },
  handle: {
    width: REORDER_LIST_SIZES.handleWidth,
    height: REORDER_LIST_SIZES.row,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
