import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'phosphor-react-native/src/icons/Check';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { BOTTOM_SHEET_SIZES, ICON_SIZES } from '@/constants/sizes';
import { SHEET_MOTION } from '@/constants/motion';
import { Divider } from '@/components/ui/Divider';
import type { BottomSheetProps, SheetItemProps, SheetOptionProps } from './types';

// The ⋯ menus: a sheet sliding up over a 50% dim, a grab bar, a centred
// title over a divider, then one rounded card of 64dp rows.
//
// `onDismiss` asks to close (tap outside, back button); `onClosed` fires once
// the slide-out has finished, so a dialog opened from a row never overlaps it.
export function BottomSheet({
  visible,
  title,
  onDismiss,
  onClosed,
  bare,
  children,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [height, setHeight] = useState(800);
  const [progress] = useState(() => new Animated.Value(0));
  // Keep the last title while sliding out, after the parent has cleared it.
  const [shownTitle, setShownTitle] = useState(title);
  if (visible && !mounted) setMounted(true);
  if (visible && title !== shownTitle) setShownTitle(title);

  const onClosedRef = useRef(onClosed);
  useEffect(() => {
    onClosedRef.current = onClosed;
  });

  const wasOpen = useRef(false);
  useEffect(() => {
    if (visible) {
      wasOpen.current = true;
      Animated.timing(progress, { toValue: 1, duration: SHEET_MOTION.openMs, useNativeDriver: true }).start();
    } else if (wasOpen.current) {
      Animated.timing(progress, { toValue: 0, duration: SHEET_MOTION.closeMs, useNativeDriver: true }).start(({ finished }) => {
        if (!finished) return;
        wasOpen.current = false;
        setMounted(false);
        onClosedRef.current?.();
      });
    }
  }, [visible, progress]);

  if (!mounted) return null;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onDismiss}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { paddingBottom: insets.bottom + 8, transform: [{ translateY }] }]}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        <View style={styles.handle} />
        {shownTitle ? (
          <>
            <Text style={styles.title} numberOfLines={1}>
              {shownTitle}
            </Text>
            <Divider />
          </>
        ) : null}
        {bare ? children : <View style={[styles.card, !shownTitle && styles.cardUntitled]}>{children}</View>}
      </Animated.View>
    </Modal>
  );
}

// One row of the sheet's card; rows after the first get a divider above them.
export function SheetItem({
  icon,
  label,
  destructive,
  first,
  onPress,
}: SheetItemProps) {
  return (
    <>
      {!first && <Divider />}
      <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={onPress}>
        <View style={styles.icon}>{icon}</View>
        <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      </Pressable>
    </>
  );
}

// A choice in a picker sheet (profile-range-sheet.jpg): 61dp rows, label
// 17.5dp in, a blue ✓ on the chosen one.
export function SheetOption({
  label,
  selected,
  first,
  onPress,
}: SheetOptionProps) {
  return (
    <>
      {!first && <Divider />}
      <Pressable style={({ pressed }) => [styles.option, pressed && styles.pressed]} onPress={onPress}>
        <Text style={[styles.label, styles.optionLabel]}>{label}</Text>
        {selected && <Check size={ICON_SIZES.xl} weight="light" color={COLORS.primary} />}
      </Pressable>
    </>
  );
}

// Row icons are thin (≈1.1dp strokes) at ~20dp: Phosphor "light" at 24.
export const sheetIcon = { size: ICON_SIZES.xl, weight: 'light' as const, color: COLORS.text };

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: COLORS.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.sheet,
    borderTopLeftRadius: RADIUS.sheet,
    borderTopRightRadius: RADIUS.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: BOTTOM_SHEET_SIZES.handleWidth,
    height: BOTTOM_SHEET_SIZES.handleHeight,
    borderRadius: RADIUS.round,
    marginTop: SPACE.sm,
    backgroundColor: COLORS.textSecondary,
  },
  title: {
    marginTop: SPACE.lg,
    marginBottom: SPACE.lg,
    paddingHorizontal: SPACE.xl,
    textAlign: 'center',
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
  },
  card: {
    marginTop: SPACE.lg,
    marginHorizontal: LAYOUT.screenMargin,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  cardUntitled: {
    marginTop: SPACE.xl,
  },
  row: {
    height: BOTTOM_SHEET_SIZES.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  option: {
    height: BOTTOM_SHEET_SIZES.optionHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: SPACE.lg,
    paddingRight: SPACE.lg,
  },
  optionLabel: {
    flex: 1,
  },
  pressed: {
    backgroundColor: COLORS.separator,
  },
  icon: {
    width: BOTTOM_SHEET_SIZES.iconWidth,
    alignItems: 'center',
    paddingRight: SPACE.xxs,
  },
  label: {
    ...TYPE.body,
  },
  destructive: {
    color: COLORS.danger,
  },
});
