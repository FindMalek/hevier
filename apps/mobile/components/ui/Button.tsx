import { memo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { SIZES } from '@/constants/sizes';
import { PRESSED_OPACITY } from '@/constants/ui';
import type { ButtonProps } from './types';

// The app's rounded button: a label, maybe an icon before it, centred.
export const Button = memo(function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'normal',
  icon,
  danger,
  disabled,
  busy,
  style,
}: ButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, styles[size], styles[variant], pressed && styles.pressed, style]}
      disabled={disabled || busy}
      onPress={onPress}>
      {busy ? (
        <ActivityIndicator color={COLORS.text} />
      ) : (
        <>
          {icon}
          <Text style={[TYPE.bodyMedium, variant === 'outline' && styles.outlineLabel, danger && styles.danger, icon ? styles.afterIcon : null]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  normal: {
    height: SIZES.buttonHeight,
  },
  compact: {
    height: SIZES.compactButtonHeight,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.surface,
  },
  neutral: {
    backgroundColor: COLORS.separator,
  },
  outline: {
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: PRESSED_OPACITY,
  },
  outlineLabel: {
    color: COLORS.primary,
  },
  danger: {
    color: COLORS.danger,
  },
  afterIcon: {
    marginLeft: SPACE.sm,
  },
});
