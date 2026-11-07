import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { memo, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CaretUp } from 'phosphor-react-native/src/icons/CaretUp';
import { TrashSimple } from 'phosphor-react-native/src/icons/TrashSimple';

import { discardActiveWorkout, useActiveWorkoutSelect, useNow, useUntil } from '@/stores/activeWorkoutStore';
import { ConfirmDialog } from './ConfirmDialog';
import { clock, elapsedLabel } from '@/lib/format/duration';
import { currentExerciseName, elapsedSeconds } from '@/lib/workout/activeWorkout';

import { HomeIcon, ProfileIcon, WorkoutIcon } from './TabIcons';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { TAB_LABELS } from '@/constants/labels';
import { HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, TAB_BAR_SIZES } from '@/constants/sizes';
import { secondsUntil } from '@/lib/date';
import type { ActiveWorkout } from '@/types/workout';
import type { TabIconProps } from '@/types/ui';
import type { PillTimeProps } from './types';

const TABS: Record<string, { label: string; Icon: ComponentType<TabIconProps> }> = {
  index: { label: TAB_LABELS.index, Icon: HomeIcon },
  workout: { label: TAB_LABELS.workout, Icon: WorkoutIcon },
  profile: { label: TAB_LABELS.profile, Icon: ProfileIcon },
};

// 51dp of content above the system gesture area, a
// 55x29dp pill 7dp from the top, label baseline at 49.5dp.
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <WorkoutPill />
      <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          const color = focused ? COLORS.primary : COLORS.text;

          function onPress() {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          }

          return (
            <Pressable
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}>
              <View style={styles.iconSlot}>
                {focused && <View style={styles.pill} />}
                <tab.Icon color={color} active={focused} />
              </View>
              <Text style={[TYPE.miniMedium, styles.label, { color }]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// The floating workout pill: it sits on the tab
// bar over the page while a workout is running. ^ (or the text) reopens Log
// Workout; the bin discards it after asking. Shows "Rest 02:45" during a rest.
// It only follows what it shows (samePill), so typing in a set doesn't redraw it.
function WorkoutPill() {
  const router = useRouter();
  const workout = useActiveWorkoutSelect(wholeWorkout, samePill);
  const [discarding, setDiscarding] = useState(false);
  const resting = useUntil(workout?.restEndsAt ?? null);
  const open = useCallback(() => router.push('/log-workout'), [router]);
  if (!workout) return null;
  return (
    <>
      <View style={styles.workoutPill}>
        <Pressable style={styles.pillButton} onPress={open} hitSlop={HIT_SLOPS.xs}>
          <CaretUp size={ICON_SIZES.lg} color={COLORS.text} />
        </Pressable>
        <Pressable style={styles.pillText} onPress={open}>
          <View style={styles.pillTitleRow}>
            <View style={[styles.pillDot, resting && styles.pillDotRest]} />
            <Text style={styles.pillTitle}>{resting ? 'Rest' : 'Workout'} </Text>
            <PillTime workout={workout} resting={resting} />
          </View>
          <Text style={styles.pillExercise} numberOfLines={1}>
            {(resting && workout.restExercise) || currentExerciseName(workout) || workout.title}
          </Text>
        </Pressable>
        <Pressable style={styles.pillButton} onPress={() => setDiscarding(true)} hitSlop={HIT_SLOPS.xs}>
          <TrashSimple size={ICON_SIZES.lg} color={DISCARD_RED} />
        </Pressable>
      </View>
      <ConfirmDialog
        visible={discarding}
        message="Are you sure you want to discard the workout in progress?"
        confirmLabel="Discard Workout"
        onConfirm={() => {
          setDiscarding(false);
          discardActiveWorkout();
        }}
        onCancel={() => setDiscarding(false)}
      />
    </>
  );
}

// The only part that changes every second.
const PillTime = memo(function PillTime({ workout, resting }: PillTimeProps) {
  const now = useNow();
  return (
    <Text style={styles.pillTime}>
      {resting
        ? clock(secondsUntil(workout.restEndsAt ?? now, now))
        : elapsedLabel(elapsedSeconds(workout, now))}
    </Text>
  );
});

function wholeWorkout(workout: ActiveWorkout | null) {
  return workout;
}

// What the pill shows; any other change keeps the copy it already has.
function samePill(a: ActiveWorkout | null, b: ActiveWorkout | null) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.title === b.title &&
    a.startTime === b.startTime &&
    a.pausedAt === b.pausedAt &&
    a.pausedSeconds === b.pausedSeconds &&
    a.restEndsAt === b.restEndsAt &&
    a.restExercise === b.restExercise &&
    currentExerciseName(a) === currentExerciseName(b)
  );
}

const DISCARD_RED = COLORS.danger;

const styles = StyleSheet.create({
  // 12.4 from the screen edges, 71 tall, 8 above the tab bar.
  workoutPill: {
    position: 'absolute',
    left: TAB_BAR_SIZES.workoutPillLeft,
    right: TAB_BAR_SIZES.workoutPillRight,
    bottom: '100%',
    marginBottom: SPACE.sm,
    height: TAB_BAR_SIZES.workoutPillHeight,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    elevation: 6,
  },
  pillButton: {
    width: TAB_BAR_SIZES.pillButtonWidth,
    height: TAB_BAR_SIZES.pillButtonHeight,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.raised,
  },
  pillText: {
    flex: 1,
    marginLeft: SPACE.lg,
  },
  pillTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACE.xs,
  },
  pillDot: {
    width: TAB_BAR_SIZES.pillDotWidth,
    height: TAB_BAR_SIZES.pillDotHeight,
    borderRadius: RADIUS.pill,
    marginRight: SPACE.md,
    backgroundColor: COLORS.done,
  },
  pillDotRest: {
    backgroundColor: COLORS.primary,
  },
  pillTitle: {
    ...TYPE.calloutSemibold,
  },
  pillTime: {
    ...TYPE.callout,
  },
  pillExercise: {
    marginTop: SPACE.xxs,
    ...TYPE.callout,
    color: COLORS.textSecondary,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    height: TAB_BAR_SIZES.tabHeight,
    paddingTop: SPACE.sm,
  },
  iconSlot: {
    width: TAB_BAR_SIZES.iconSlotWidth,
    height: TAB_BAR_SIZES.iconSlotHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Drawn behind the icon rather than around it, so the icon can overflow
  // the pill without Android clipping or squaring its corners.
  pill: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.tabIndicator,
  },
  label: {
    marginTop: SPACE.xs,
    lineHeight: LINE_HEIGHTS.tight,
  },
});
