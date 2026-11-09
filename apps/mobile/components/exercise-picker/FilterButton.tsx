import { Pressable, StyleSheet, Text } from 'react-native';
import { XCircle } from 'phosphor-react-native/src/icons/XCircle';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ADD_EXERCISE_SIZES, ICON_SIZES } from '@/constants/sizes';
import type { FilterButtonProps } from './types';

// "All Equipment" until something is picked, then a blue chip naming the
// picks ("Biceps, Forearms") with ⊗ to clear them (add-exercise-filtered.jpg).
export function FilterButton({ label, picks, onPress, onClear }: FilterButtonProps) {
  const on = picks.length > 0;
  return (
    <Pressable style={({ pressed }) => [styles.filter, on && styles.filterOn, pressed && styles.pressed]} onPress={onPress}>
      <Text style={[styles.filterLabel, on && styles.filterLabelOn]} numberOfLines={1}>
        {on ? picks.join(', ') : label}
      </Text>
      {on && (
        <Pressable onPress={onClear} hitSlop={HIT_SLOPS.lg}>
          <XCircle size={ICON_SIZES.lg} weight="fill" color={COLORS.text} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filter: {
    flex: 1,
    height: ADD_EXERCISE_SIZES.filterHeight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  filterOn: {
    flexDirection: 'row',
    paddingLeft: SPACE.md,
    paddingRight: SPACE.sm,
    backgroundColor: COLORS.primary,
  },
  filterLabel: {
    ...TYPE.bodyMedium,
  },
  filterLabelOn: {
    flexShrink: 1,
    marginRight: SPACE.xs,
  },
  pressed: {
    opacity: 0.8,
  },
});
