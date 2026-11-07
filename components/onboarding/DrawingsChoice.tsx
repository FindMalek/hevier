import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GenderFemale } from 'phosphor-react-native/src/icons/GenderFemale';
import { GenderMale } from 'phosphor-react-native/src/icons/GenderMale';

import { COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { ONBOARDING_SIZES } from '@/constants/sizes';
import type { Drawings } from '@/types/profile';
import type { DrawingsChoiceProps } from './types';

const CHOICES: { value: Drawings; label: string; Icon: typeof GenderMale }[] = [
  { value: 'male', label: 'Male', Icon: GenderMale },
  { value: 'female', label: 'Female', Icon: GenderFemale },
];

// Two cards side by side; the picked one has a blue border.
export function DrawingsChoice({ value, onChange }: DrawingsChoiceProps) {
  return (
    <View style={styles.row}>
      {CHOICES.map(({ value: v, label, Icon }) => {
        const on = v === value;
        return (
          <Pressable key={v} style={[styles.card, on && styles.cardOn]} onPress={() => onChange(v)}>
            <Icon size={ONBOARDING_SIZES.choiceIcon} color={on ? COLORS.primary : COLORS.text} />
            <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACE.md,
  },
  card: {
    flex: 1,
    height: ONBOARDING_SIZES.choiceHeight,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    borderWidth: BORDER_WIDTHS.thin,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.sm,
  },
  cardOn: {
    borderColor: COLORS.primary,
  },
  label: {
    ...TYPE.bodySemibold,
  },
  labelOn: {
    color: COLORS.primary,
  },
});
