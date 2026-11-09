import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, TAB_HEADER_SIZES } from '@/constants/sizes';
import type { HeaderIconButtonProps, TabHeaderProps } from './types';

// The large title row at the top of each tab ("Home ⌄", "Workout ⌄",
// username). Title centre 17.5dp below the status bar,
// 16dp from the left; right-hand icons sit in 40dp boxes, 8dp from the edge.
// The header block is 39.6dp tall and gets a 1px divider once the content
// below it has scrolled.
export function TabHeader({
  title,
  onTitlePress,
  right,
  divider = false,
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <Pressable style={styles.titleButton} onPress={onTitlePress} disabled={!onTitlePress}>
          <Text style={TYPE.displaySemibold} numberOfLines={1}>
            {title}
          </Text>
          {onTitlePress && (
            <View style={styles.chevron}>
              <CaretDown size={ICON_SIZES.xs} color={COLORS.text} weight="bold" />
            </View>
          )}
        </Pressable>
        <View style={styles.right}>{right}</View>
      </View>
      {/* Its own 1px view so it snaps to a whole pixel row instead of blending across two. */}
      <View style={[styles.divider, divider && styles.dividerVisible]} />
    </View>
  );
}

export function HeaderIconButton({ children, onPress }: HeaderIconButtonProps) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress} hitSlop={HIT_SLOPS.xs}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.background,
  },
  divider: {
    marginTop: SPACE.xs,
    height: StyleSheet.hairlineWidth, // the divider is 1 physical pixel
  },
  dividerVisible: {
    backgroundColor: COLORS.separator,
  },
  row: {
    height: TAB_HEADER_SIZES.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACE.lg,
    paddingRight: SPACE.sm,
  },
  titleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chevron: {
    width: TAB_HEADER_SIZES.chevronWidth,
    height: TAB_HEADER_SIZES.chevronHeight,
    borderRadius: RADIUS.round,
    marginLeft: SPACE.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    marginLeft: 'auto',
    flexDirection: 'row',
    marginTop: -SPACE.xxs, // the icons sit slightly above the title's centre line
  },
  iconButton: {
    width: TAB_HEADER_SIZES.iconButtonWidth,
    height: TAB_HEADER_SIZES.iconButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
