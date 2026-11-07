import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { TAB_LABELS } from '@/constants/labels';
import { COLORS, TYPE } from '@/constants/theme';

const label = { ...TYPE.miniMedium, color: COLORS.text };
const selectedLabel = { ...label, color: COLORS.primary };

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={COLORS.surface}
      indicatorColor={COLORS.tabIndicator}
      iconColor={COLORS.text}
      labelStyle={label}
      labelVisibilityMode="labeled"
      rippleColor="transparent">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon drawable={{ default: 'tab_home', selected: 'tab_home_active' }} selectedColor={COLORS.primary} />
        <NativeTabs.Trigger.Label selectedStyle={selectedLabel}>{TAB_LABELS.index}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workout">
        <NativeTabs.Trigger.Icon drawable={{ default: 'tab_workout', selected: 'tab_workout_active' }} selectedColor={COLORS.primary} />
        <NativeTabs.Trigger.Label selectedStyle={selectedLabel}>{TAB_LABELS.workout}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon drawable={{ default: 'tab_profile', selected: 'tab_profile_active' }} selectedColor={COLORS.primary} />
        <NativeTabs.Trigger.Label selectedStyle={selectedLabel}>{TAB_LABELS.profile}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
