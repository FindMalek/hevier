import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { ACTION_BAR_SIZES } from '@/constants/sizes';
import type { ActionBarProps } from './types';

// Grey full-width action bars ("Start Empty Workout", "New Routine"):
// 48dp tall, radius 9.5, icon 19.4dp in, label 48.8dp in.
export function ActionBar({
  icon,
  label,
  onPress,
  style,
}: ActionBarProps) {
  return (
    <Pressable style={({ pressed }) => [styles.bar, pressed && styles.pressed, style]} onPress={onPress}>
      <View style={styles.icon}>{icon}</View>
      <Text style={TYPE.bodyMedium}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: ACTION_BAR_SIZES.barHeight,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: ACTION_BAR_SIZES.iconWidth,
    paddingLeft: SPACE.lg,
  },
});
