import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { HeaderTextButton, InnerHeader } from '@/components/ui/InnerHeader';
import { restLabel } from '@/lib/format/duration';
import { Toggle } from '@/components/ui/Toggle';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { getWorkoutSettings, saveWorkoutSettings } from '@/db/workoutSettings';
import { DEFAULT_WORKOUT_SETTINGS } from '@/constants/defaults';
import type { ToggleRowProps, WorkoutSettings } from '@/types/workoutSettings';
import { LAYOUT, SPACE } from '@/constants/layout';
import { ICON_SIZES, SIZES, WORKOUT_SETTINGS_SIZES } from '@/constants/sizes';
import { Screen } from '@/components/ui/Screen';
import { RestTimerSheet } from '@/components/set-table/RestTimerSheet';

// Workout Settings, opened from Log Workout's Settings: Default Rest Timer,
// Keep Awake, Reps Left (in RPE Tracking's place), Inline Timer and Live PR
// Notification. Each change is saved at once; Done and ← just go back.
export default function WorkoutSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<WorkoutSettings>(DEFAULT_WORKOUT_SETTINGS);
  const [restOpen, setRestOpen] = useState(false);

  useEffect(() => {
    getWorkoutSettings().then(setSettings);
  }, []);

  function change(next: Partial<WorkoutSettings>) {
    const updated = { ...settings, ...next };
    setSettings(updated);
    saveWorkoutSettings(updated);
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Workout Settings" right={<HeaderTextButton label="Done" onPress={() => router.back()} />} />
      <ScrollView>
        <Pressable style={({ pressed }) => [styles.row, pressed && styles.pressed]} onPress={() => setRestOpen(true)}>
          <Text style={styles.title}>Default Rest Timer</Text>
          <Text style={styles.value}>{settings.defaultRestSeconds ? restLabel(settings.defaultRestSeconds) : 'Off'}</Text>
          <CaretRight size={ICON_SIZES.md} color={COLORS.textSecondary} />
        </Pressable>
        <ToggleRow
          title="Keep Awake During Workout"
          description="Enable this if you don't want your phone to sleep while you're in a workout"
          value={settings.keepAwake}
          onChange={(keepAwake) => change({ keepAwake })}
        />
        <ToggleRow
          title="Reps Left"
          description="After the last set of an exercise, asks how many more reps you could have done. It makes your statistics more accurate."
          value={settings.repsLeft}
          onChange={(repsLeft) => change({ repsLeft })}
        />
        <ToggleRow
          title="Inline Timer"
          description="Duration exercises have a built-in stopwatch for tracking time for each set"
          value={settings.inlineTimer}
          onChange={(inlineTimer) => change({ inlineTimer })}
        />
        <ToggleRow
          title="Live Personal Record Notification"
          description="When enabled, it'll notify you when you achieve a Personal Record upon checking the set."
          value={settings.prAlert}
          onChange={(prAlert) => change({ prAlert })}
        />
      </ScrollView>

      <RestTimerSheet
        visible={restOpen}
        title="Default Rest Timer"
        value={settings.defaultRestSeconds}
        onPick={(seconds) => change({ defaultRestSeconds: seconds })}
        onDismiss={() => setRestOpen(false)}
      />
    </Screen>
  );
}

function ToggleRow({
  title,
  description,
  value,
  onChange,
}: ToggleRowProps) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTop}>
        <Text style={styles.title}>{title}</Text>
        <Toggle value={value} onChange={onChange} />
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

// Measured on workout-settings.jpg (2.625 px/dp): 60 rows, 16 side margins,
// dividers inset 16 like the rows.
const styles = StyleSheet.create({
  row: {
    height: SIZES.settingsRowHeight,
    marginHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    ...TYPE.row,
  },
  value: {
    marginRight: SPACE.xs,
    ...TYPE.row,
    color: COLORS.textSecondary,
  },
  toggleRow: {
    marginHorizontal: LAYOUT.screenMargin,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  toggleTop: {
    minHeight: WORKOUT_SETTINGS_SIZES.toggleTopMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    marginTop: SPACE.sm,
    ...TYPE.callout,
    lineHeight: LINE_HEIGHTS.snug,
    color: COLORS.textSecondary,
  },
});
