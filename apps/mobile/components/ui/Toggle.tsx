import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { TOGGLE_SIZES } from '@/constants/sizes';
import type { ToggleProps } from './types';

// A switch: a 47.6×27.8 pill,
// blue when on, dark grey when off, with a 23 white knob.
export function Toggle({ value, onChange }: ToggleProps) {
  return (
    <Pressable
      style={[styles.track, value && styles.trackOn]}
      onPress={() => onChange(!value)}
      hitSlop={HIT_SLOPS.md}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}>
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TOGGLE_SIZES.trackWidth,
    height: TOGGLE_SIZES.trackHeight,
    borderRadius: RADIUS.round,
    justifyContent: 'center',
    paddingHorizontal: SPACE.xxs,
    backgroundColor: COLORS.separator,
  },
  trackOn: {
    backgroundColor: COLORS.primary,
  },
  knob: {
    width: TOGGLE_SIZES.knobWidth,
    height: TOGGLE_SIZES.knobHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.white,
  },
  knobOn: {
    alignSelf: 'flex-end',
  },
});
