import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector, ScrollView as GHScrollView } from 'react-native-gesture-handler';
import Animated, { measure, scrollTo, useAnimatedRef, useAnimatedStyle, useFrameCallback, useScrollOffset, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';

import { COLORS, withAlpha } from '@/constants/theme';
import { dropTarget } from '@/lib/routineDrop';
import { BORDER_WIDTHS, RADIUS } from '@/constants/layout';
import { ROUTINE_DRAG_SIZES } from '@/constants/sizes';
import { ROUTINE_DRAG_MOTION } from '@/constants/motion';
import type { Box, DragItemProps, RoutineDrag, RoutineDragOptions, RoutineDragResult } from './types';

// Drag a routine card to another folder, or another spot in its own, on the
// Workout tab. Hold a card:
// it lifts and follows the finger, the cards around slide apart to open a gap
// where it would land, and letting go glides it in and saves. The list is one
// flat run of items (folder names, cards, empty-folder boxes); everything runs
// on the UI thread, so the screen doesn't re-render while dragging.



export function useRoutineDrag({
  items,
  onDrop,
  renderGhost,
}: RoutineDragOptions): RoutineDragResult {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const listRef = useAnimatedRef<View>();
  const scroll = useScrollOffset(scrollRef);
  const boxes = useSharedValue<Box[]>([]);
  const dragging = useSharedValue(-1);
  const target = useSharedValue(-1);
  const finger = useSharedValue(0); // window y
  const fingerStart = useSharedValue(0);
  const scrollStart = useSharedValue(0);
  const top = useSharedValue(0); // the lifted card's top, in the list's view
  const listTop = useSharedValue(0); // the list's top, window y
  const listHeight = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const dropping = useSharedValue(false);
  const lift = useSharedValue(0); // 0 → 1 as the card lifts
  const ghostReady = useSharedValue(false);
  const pendingReset = useSharedValue(false);
  const [ghostId, setGhostId] = useState<string | null>(null);
  // The latest items and onDrop for the callbacks below, which stay the same
  // across renders so each item's gesture is built once (not on every render).
  const itemsRef = useRef(items);
  const onDropRef = useRef(onDrop);
  useLayoutEffect(() => {
    itemsRef.current = items;
    onDropRef.current = onDrop;
  });

  // Each item's place, measured by its own onLayout (y in the content).
  const count = items.length;
  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      boxes.modify((all) => {
        'worklet';
        all[index] = { y, h: height };
        all.length = count;
        return all;
      });
    },
    [boxes, count]
  );

  const onListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      listHeight.set(e.nativeEvent.layout.height);
    },
    [listHeight]
  );

  const onContentSize = useCallback(
    (_: number, height: number) => {
      contentHeight.set(height);
    },
    [contentHeight]
  );

  const lifted = useCallback((index: number) => {
    const item = itemsRef.current[index];
    if (item?.kind === 'card') setGhostId(item.key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, []);

  const moved = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const dropped = useCallback(
    (s: number, t: number) => {
      const all = itemsRef.current;
      const item = all[s];
      const place = dropTarget(all, s, t);
      // The new order shows before the gap closes (useLayoutEffect below).
      pendingReset.set(true);
      setGhostId(null); // in the same render as the new order
      if (item) onDropRef.current(item.key, place.folderId, place.index);
    },
    [pendingReset]
  );

  const cancelled = useCallback(() => {
    setGhostId(null);
  }, []);

  // The original card hides only once its copy is drawn, so it never blinks.
  useLayoutEffect(() => {
    ghostReady.set(ghostId !== null);
  }, [ghostId, ghostReady]);

  // After the reordered list is on screen: end the drag without a jump.
  useLayoutEffect(() => {
    if (!pendingReset.get()) return;
    pendingReset.set(false);
    dragging.set(-1);
    target.set(-1);
    dropping.set(false);
    lift.set(0);
  }, [items, dragging, target, dropping, lift, pendingReset]);

  // Insertion point for the lifted card's middle, among the other items.
  // Never before the first folder's name.
  const insertionAt = useCallback(
    (middle: number) => {
      'worklet';
      const all = boxes.get();
      const s = dragging.get();
      let t = 0;
      for (let i = 0; i < all.length; i++) {
        if (i === s || !all[i]) continue;
        if (all[i].y + all[i].h / 2 < middle) t++;
      }
      return Math.max(1, t);
    },
    [boxes, dragging]
  );

  // Where the lifted card would sit (content y) for insertion point t.
  const slotTop = useCallback(
    (t: number) => {
      'worklet';
      const all = boxes.get();
      const s = dragging.get();
      const h = all[s]?.h ?? 0;
      let k = 0;
      let end = 0;
      // The end of the item just before it, after that item has moved: items
      // after the old spot and before the new one move up by the card's height.
      for (let i = 0; i < all.length; i++) {
        if (i === s || !all[i]) continue;
        if (k === t) break;
        end = all[i].y + all[i].h - (i > s ? h : 0);
        k++;
      }
      return end;
    },
    [boxes, dragging]
  );

  // Every frame while lifted: follow the finger, scroll near the edges,
  // update the gap. Off until a card is lifted: left on, it would wake the
  // phone on every screen refresh, even with the Workout tab out of sight.
  const frame = useFrameCallback(() => {
    const s = dragging.get();
    if (s < 0 || dropping.get()) return;
    const fromTop = finger.get() - listTop.get();
    let step = 0;
    if (fromTop < ROUTINE_DRAG_SIZES.edge) step = -ROUTINE_DRAG_SIZES.maxStep * (1 - Math.max(0, fromTop) / ROUTINE_DRAG_SIZES.edge);
    else if (fromTop > listHeight.get() - ROUTINE_DRAG_SIZES.edge)
      step = ROUTINE_DRAG_SIZES.maxStep * Math.min(1, (fromTop - (listHeight.get() - ROUTINE_DRAG_SIZES.edge)) / ROUTINE_DRAG_SIZES.edge);
    if (step !== 0) {
      const max = Math.max(0, contentHeight.get() - listHeight.get());
      const next = Math.min(max, Math.max(0, scroll.get() + step));
      if (next !== scroll.get()) scrollTo(scrollRef, 0, next, false);
    }
    const start = boxes.get()[s];
    if (!start) return;
    top.set(start.y - scrollStart.get() + (finger.get() - fingerStart.get()));
    const t = insertionAt(top.get() + scroll.get() + start.h / 2);
    if (t !== target.get()) {
      if (target.get() >= 0) scheduleOnRN(moved);
      target.set(t);
    }
  }, false);
  const follow = useCallback((on: boolean) => frame.setActive(on), [frame]);

  const pan = useCallback(
    (index: number) =>
      Gesture.Pan()
        .activateAfterLongPress(ROUTINE_DRAG_MOTION.holdMs)
        .onStart((e) => {
          // Where the list sits on screen, for the edges that scroll it.
          const box = measure(listRef);
          if (box) listTop.set(box.pageY);
          dragging.set(index);
          fingerStart.set(e.absoluteY);
          finger.set(e.absoluteY);
          scrollStart.set(scroll.get());
          top.set((boxes.get()[index]?.y ?? 0) - scroll.get());
          target.set(-1);
          lift.set(withSpring(1, ROUTINE_DRAG_MOTION.liftSpring));
          scheduleOnRN(lifted, index);
          scheduleOnRN(follow, true);
        })
        .onUpdate((e) => {
          finger.set(e.absoluteY);
        })
        .onEnd(() => {
          const s = dragging.get();
          const t = target.get();
          if (s < 0) return;
          if (t < 0) {
            // Let go before the first frame: nothing moved.
            dragging.set(-1);
            lift.set(0);
            scheduleOnRN(cancelled);
            return;
          }
          dropping.set(true);
          lift.set(withTiming(0, { duration: ROUTINE_DRAG_MOTION.dropMs }));
          top.set(
            withTiming(slotTop(t) - scroll.get(), { duration: ROUTINE_DRAG_MOTION.dropMs }, (done) => {
              if (done) scheduleOnRN(dropped, s, t);
            })
          );
        })
        .onFinalize((_, success) => {
          scheduleOnRN(follow, false);
          if (success || dragging.get() !== index || dropping.get()) return;
          dragging.set(-1);
          target.set(-1);
          lift.set(0);
          scheduleOnRN(cancelled);
        }),
    [listRef, listTop, dragging, fingerStart, finger, scrollStart, scroll, top, boxes, target, lift, dropping, slotTop, lifted, cancelled, dropped, follow]
  );

  const ghostStyle = useAnimatedStyle(() => ({
    opacity: dragging.get() >= 0 && ghostReady.get() ? 1 : 0,
    transform: [{ translateY: top.get() }, { scale: 1 + (ROUTINE_DRAG_MOTION.liftScale - 1) * lift.get() }],
    shadowOpacity: 0.55 * lift.get(),
    elevation: 16 * lift.get(),
  }));

  // A faint outline where the card would land.
  const slotStyle = useAnimatedStyle(() => {
    const s = dragging.get();
    const t = target.get();
    if (s < 0 || t < 0) return { opacity: 0 };
    const h = boxes.get()[s]?.h ?? 0;
    return {
      opacity: withTiming(dropping.get() ? 0 : 1, { duration: ROUTINE_DRAG_MOTION.slotFadeMs }),
      height: h - 16,
      transform: [{ translateY: withTiming(slotTop(t) - scroll.get(), { duration: ROUTINE_DRAG_MOTION.shiftMs }) }],
    };
  });

  const overlay = (
    <>
      <Animated.View pointerEvents="none" style={[styles.slot, slotStyle]} />
      {ghostId && (
        <Animated.View pointerEvents="none" style={[styles.ghost, ghostStyle]}>
          {renderGhost(ghostId)}
        </Animated.View>
      )}
    </>
  );

  // Stable, so the memo'd items don't redraw when the screen does (the overlay apart: it changes on lift).
  const drag = useMemo<RoutineDrag>(
    () => ({ dragging, target, ghostReady, boxes, onItemLayout, pan, onListLayout, onContentSize }),
    [dragging, target, ghostReady, boxes, onItemLayout, pan, onListLayout, onContentSize]
  );
  // The refs apart: what's in `drag` is read while rendering.
  return { drag, overlay, scrollRef, listRef };
}

// One item of the list: slides out of the way while a card is dragged past
// it. A card can be lifted; the lifted one is hidden (its copy follows the finger).
// Memoized: give it stable children (see the Workout tab) and it only redraws when its own item does.
export const DragItem = memo(function DragItem({
  drag,
  index,
  draggable,
  children,
}: DragItemProps) {
  const { dragging, target, boxes, ghostReady, onItemLayout, pan } = drag;
  const style = useAnimatedStyle(() => {
    const s = dragging.get();
    const t = target.get();
    if (s < 0) return { opacity: 1, transform: [{ translateY: 0 }] };
    if (index === s) return { opacity: ghostReady.get() ? 0 : 1, transform: [{ translateY: 0 }] };
    const h = boxes.get()[s]?.h ?? 0;
    // Its place in the list without the lifted card, and whether the gap
    // opens above it (moves down) or the lifted card's old place closes (up).
    const k = index < s ? index : index - 1;
    let shift = 0;
    if (t >= 0) {
      if (index < s && k >= t) shift = h;
      else if (index > s && k < t) shift = -h;
    }
    return { opacity: 1, transform: [{ translateY: withTiming(shift, { duration: ROUTINE_DRAG_MOTION.shiftMs }) }] };
  });
  const onLayout = useCallback((e: LayoutChangeEvent) => onItemLayout(index, e), [onItemLayout, index]);
  // Built once per place in the list: a new gesture each render made the handler re-attach.
  const gesture = useMemo(() => (draggable ? pan(index) : null), [draggable, pan, index]);
  const body = (
    <Animated.View style={style} onLayout={onLayout}>
      {children}
    </Animated.View>
  );
  return gesture ? <GestureDetector gesture={gesture}>{body}</GestureDetector> : body;
});

// The Workout tab's scrolling list, ready for dragging: a gesture-aware
// ScrollView the drag can scroll by itself.
export const DragScrollView = Animated.createAnimatedComponent(GHScrollView);

const styles = StyleSheet.create({
  ghost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    shadowColor: COLORS.black,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: ROUTINE_DRAG_SIZES.shadowOffsetHeight },
  },
  slot: {
    position: 'absolute',
    top: 0,
    left: ROUTINE_DRAG_SIZES.slotLeft,
    right: ROUTINE_DRAG_SIZES.slotRight,
    borderRadius: RADIUS.xl,
    borderWidth: BORDER_WIDTHS.thin,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: withAlpha(COLORS.primary, 0.08),
  },
});
