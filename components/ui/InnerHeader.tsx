import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'phosphor-react-native/src/icons/ArrowLeft';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';

import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, INNER_HEADER_SIZES } from '@/constants/sizes';
import type { HeaderPillButtonProps, HeaderTextButtonProps, HeaderTextLeftProps, InnerHeaderProps } from './types';

// The grey header on inner pages (Workout Settings, Routine): ← on the
// left, centred title, an optional action on the right. 51.5dp under the
// status bar, the row sitting 2.5dp above its middle.
export function InnerHeader({
  title,
  onTitlePress,
  onBack,
  left,
  right,
}: InnerHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {left ? (
        <View style={styles.side}>{left}</View>
      ) : (
        <Pressable style={styles.side} onPress={onBack ?? (() => router.back())} hitSlop={HIT_SLOPS.md}>
          <ArrowLeft size={ICON_SIZES.lg} color={COLORS.text} />
        </Pressable>
      )}
      {onTitlePress ? (
        <Pressable style={styles.titleButton} onPress={onTitlePress} hitSlop={HIT_SLOPS.md}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
          <CaretDown size={ICON_SIZES.sm} weight="bold" color={COLORS.text} style={styles.titleCaret} />
        </Pressable>
      ) : (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      )}
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  );
}

// The blue header button ("Finish" on Log Workout): 36.6dp tall, 16 from
// the right edge, label 16 medium. Grey and inert while disabled.
export function HeaderPillButton({ label, disabled, onPress }: HeaderPillButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.pill, disabled && styles.pillDisabled, pressed && !disabled && styles.pillPressed]}
      disabled={disabled}
      onPress={onPress}>
      <Text style={styles.pillLabel}>{label}</Text>
    </Pressable>
  );
}

// Plain text on the left of the header ("Cancel").
export function HeaderTextLeft({ label, onPress }: HeaderTextLeftProps) {
  return (
    <Pressable onPress={onPress} hitSlop={HIT_SLOPS.md}>
      <Text style={styles.leftLabel}>{label}</Text>
    </Pressable>
  );
}

// "Done" on the right of the header.
export function HeaderTextButton({ label, onPress }: HeaderTextButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={HIT_SLOPS.md} style={styles.textButton}>
      <Text style={styles.textButtonLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACE.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  side: {
    width: INNER_HEADER_SIZES.sideWidth,
    height: INNER_HEADER_SIZES.sideHeight,
    justifyContent: 'center',
    paddingLeft: SPACE.lg,
  },
  right: {
    paddingLeft: 0,
    alignItems: 'flex-end',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...TYPE.body,
  },
  titleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    ...TYPE.body,
  },
  titleCaret: {
    marginLeft: SPACE.sm,
  },
  textButton: {
    paddingRight: SPACE.xxl,
  },
  pill: {
    height: INNER_HEADER_SIZES.pillHeight,
    marginRight: SPACE.lg,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  pillDisabled: {
    backgroundColor: COLORS.separator,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillLabel: {
    ...TYPE.bodyMedium,
  },
  leftLabel: {
    ...TYPE.body,
  },
  textButtonLabel: {
    ...TYPE.bodyMedium,
    color: COLORS.primary,
  },
});
