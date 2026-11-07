import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { Plus } from 'phosphor-react-native/src/icons/Plus';

import { COLORS, FONT_SIZES, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, ROUTINE_LIST_SIZES, SIZES } from '@/constants/sizes';
import { Button } from '@/components/ui/Button';
import type { AddRoutineBoxProps, FolderHeaderProps, MoreButtonProps, RoutineCardProps } from './types';

// Pieces of the Workout tab's routine list.

// The "⋯": three 3.4dp dots, 17.9dp wide overall.
export function MoreButton({ onPress }: MoreButtonProps) {
  return (
    <Pressable style={styles.more} onPress={onPress} hitSlop={HIT_SLOPS.lg}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.dot} />
      ))}
    </Pressable>
  );
}

// "▾ My routine (4)  ⋯" — tapping the label collapses the folder.
export function FolderHeader({
  title,
  collapsed,
  onToggle,
  onMore,
}: FolderHeaderProps) {
  return (
    <View style={styles.folderRow}>
      <Pressable style={styles.folderToggle} onPress={onToggle}>
        <Svg width={11} height={11} viewBox="0 0 10 10" style={collapsed && styles.caretCollapsed}>
          <Path d="M0 2.3h10L5 7.8z" fill={COLORS.text} />
        </Svg>
        <Text style={[TYPE.body, styles.folderTitle]}>{title}</Text>
      </Pressable>
      {onMore && <MoreButton onPress={onMore} />}
    </View>
  );
}

export function RoutineCard({
  routine,
  onPress,
  onStart,
  onMore,
}: RoutineCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardTitleRow}>
        <Text style={[TYPE.titleSemibold, styles.cardTitle]} numberOfLines={1}>
          {routine.name}
        </Text>
        <MoreButton onPress={onMore} />
      </View>
      <Text style={[TYPE.body, styles.cardExercises]} numberOfLines={2}>
        {routine.exerciseNames.join(', ')}
      </Text>
      <Button label="Start Routine" size="compact" style={styles.startButton} onPress={onStart} />
    </Pressable>
  );
}

// Dashed "+ Add new routine" box shown in an empty folder.
export function AddRoutineBox({ onPress }: AddRoutineBoxProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <Pressable style={styles.addBox} onPress={onPress} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      <Svg style={StyleSheet.absoluteFill}>
        {size.width > 0 && (
          <Rect
            x={0.6}
            y={0.6}
            width={size.width - 1.2}
            height={size.height - 1.2}
            rx={12}
            fill="none"
            stroke={COLORS.dashedBorder}
            strokeWidth={1.1}
            strokeDasharray="3 2.9"
          />
        )}
      </Svg>
      <Plus size={ICON_SIZES.md} color={COLORS.primary} />
      <Text style={[TYPE.bodyMedium, styles.addLabel]}>Add new routine</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  more: {
    width: ROUTINE_LIST_SIZES.moreWidth,
    height: SIZES.smallButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: ROUTINE_LIST_SIZES.dotWidth,
    height: ROUTINE_LIST_SIZES.dotHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.text,
  },
  folderRow: {
    height: ROUTINE_LIST_SIZES.folderRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACE.lg,
    paddingRight: SPACE.lg,
  },
  folderToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  caretCollapsed: {
    transform: [{ rotate: '-90deg' }],
  },
  folderTitle: {
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.normal,
    marginLeft: SPACE.md,
  },
  card: {
    height: ROUTINE_LIST_SIZES.cardHeight,
    marginHorizontal: LAYOUT.screenMargin,
    marginBottom: SPACE.lg,
    paddingHorizontal: LAYOUT.screenMargin,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACE.lg,
    paddingRight: SPACE.xxs,
  },
  cardTitle: {
    flex: 1,
  },
  cardExercises: {
    color: COLORS.textSecondary,
    lineHeight: LINE_HEIGHTS.normal,
    marginTop: SPACE.xxs,
  },
  startButton: {
    position: 'absolute',
    left: ROUTINE_LIST_SIZES.startButtonLeft,
    right: ROUTINE_LIST_SIZES.startButtonRight,
    bottom: ROUTINE_LIST_SIZES.startButtonBottom,
  },
  addBox: {
    height: ROUTINE_LIST_SIZES.addBoxHeight,
    marginHorizontal: SPACE.xl,
    marginTop: -SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    marginLeft: SPACE.sm,
    fontSize: FONT_SIZES.callout,
    color: COLORS.primary,
  },
});
