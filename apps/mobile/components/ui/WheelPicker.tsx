import { useCallback, useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { RADIUS } from '@/constants/layout';
import { WHEEL_PICKER_SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import type { WheelPickerProps } from './types';

// Scroll wheels (Duration sheet):
// three 48dp rows, the middle one white on a rounded box, its neighbours grey.
// `onChange` fires once the wheel has settled on a row.

export function WheelPicker({
  items,
  index,
  onChange,
  width,
  flex,
}: WheelPickerProps) {
  const list = useRef<FlatList<string>>(null);
  const shown = useRef(index);

  // Follow a change made elsewhere (the other wheel, a clamp to now).
  useEffect(() => {
    if (index === shown.current) return;
    shown.current = index;
    list.current?.scrollToOffset({ offset: index * WHEEL_PICKER_SIZES.wheelRow, animated: false });
  }, [index]);

  // Redrawn only when the selected row moves (extraData tells the list).
  const renderItem = useCallback(
    ({ item, index: i }: { item: string; index: number }) => (
      <View style={styles.row}>
        <Text style={[styles.label, i === index && styles.selected]}>{item}</Text>
      </View>
    ),
    [index]
  );

  function settle(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.max(0, Math.min(items.length - 1, Math.round(e.nativeEvent.contentOffset.y / WHEEL_PICKER_SIZES.wheelRow)));
    if (i === shown.current) return;
    shown.current = i;
    onChange(i);
  }

  return (
    <View style={[styles.wheel, width !== undefined && { width }, flex !== undefined && { flex }]}>
      <View style={styles.highlight} pointerEvents="none" />
      <FlatList
        ref={list}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={index}
        getItemLayout={getItemLayout}
        initialScrollIndex={index}
        {...LIST_RENDERING.wheelPicker}
        snapToInterval={WHEEL_PICKER_SIZES.wheelRow}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        contentContainerStyle={styles.padding}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={(e) => {
          // A slow drag that stops on a row has no momentum phase.
          if (!e.nativeEvent.velocity?.y) settle(e);
        }}
      />
    </View>
  );
}

function keyExtractor(_: string, i: number) {
  return String(i);
}

function getItemLayout(_: ArrayLike<string> | null | undefined, i: number) {
  return { length: WHEEL_PICKER_SIZES.wheelRow, offset: WHEEL_PICKER_SIZES.wheelRow * i, index: i };
}

const styles = StyleSheet.create({
  wheel: {
    height: WHEEL_PICKER_SIZES.wheelRow * 3,
  },
  padding: {
    paddingVertical: WHEEL_PICKER_SIZES.wheelRow,
  },
  highlight: {
    position: 'absolute',
    top: WHEEL_PICKER_SIZES.wheelRow,
    left: 0,
    right: 0,
    height: WHEEL_PICKER_SIZES.wheelRow,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  row: {
    height: WHEEL_PICKER_SIZES.wheelRow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPE.heading,
    color: COLORS.textSecondary,
  },
  selected: {
    color: COLORS.text,
  },
});
