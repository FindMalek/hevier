import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ClipboardText } from 'phosphor-react-native/src/icons/ClipboardText';
import { Plus } from 'phosphor-react-native/src/icons/Plus';
import { SlidersHorizontal } from 'phosphor-react-native/src/icons/SlidersHorizontal';
import { UploadSimple } from 'phosphor-react-native/src/icons/UploadSimple';

import { BottomSheet, SheetItem, SheetOption, sheetIcon } from '@/components/ui/BottomSheet';
import { InnerHeader } from '@/components/ui/InnerHeader';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { Screen } from '@/components/ui/Screen';
import { MonthView } from '@/components/calendar/MonthView';
import { YearView } from '@/components/calendar/YearView';
import { MultiYearView } from '@/components/calendar/MultiYearView';
import { COLORS } from '@/constants/theme';
import { VIEW_DEFAULTS } from '@/constants/defaults';
import { CALENDAR_VIEWS } from '@/constants/labels';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES } from '@/constants/sizes';
import { getWorkoutDays } from '@/db/calendar/workoutDays';
import { getProfile } from '@/db/profile/profile';
import { getRoutineOverview } from '@/db/routines/folders';
import { dayKey } from '@/lib/date';
import { weekdayDate } from '@/lib/format/date';
import type { CalendarView, WorkoutDays } from '@/types/calendar';
import type { Profile } from '@/types/profile';
import type { RoutineSummary } from '@/types/routine';

// The Calendar: Month (days with the workout's name), Year (a small grid per month) and
// Multi-year (a week-column grid per year). Newest at the bottom.
// Share and the filter icon are there for the look only. Tapping a workout day
// opens that workout; tapping an empty day up to today logs a workout for it
// (a sheet: empty or one of the routines).
// The views live in components/calendar/.

export default function CalendarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Room for the navigation bar under the newest month (inverted lists start at the bottom).
  const bottomSpace = useMemo(() => <View style={{ height: insets.bottom + SPACE.sm }} />, [insets.bottom]);
  const [view, setView] = useState<CalendarView>(VIEW_DEFAULTS.calendar);
  const [viewSheet, setViewSheet] = useState(false);
  const [days, setDays] = useState<WorkoutDays | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [routines, setRoutines] = useState<RoutineSummary[]>([]);
  const [logDay, setLogDay] = useState<Date | null>(null);
  const { start, dialog } = useStartWorkout();

  useFocusEffect(
    useCallback(() => {
      getWorkoutDays().then(setDays);
      getProfile().then(setProfile);
      // In the Workout tab's order: folders first, then My Routines.
      getRoutineOverview().then((o) => setRoutines([...o.folders.flatMap((f) => f.routines), ...o.unfiled]));
    }, [])
  );

  // Stable, so the memo'd months don't redraw on every render of the screen.
  const openDay = useCallback(
    (date: Date) => {
      const workouts = days?.get(dayKey(date));
      if (workouts?.length) router.push(`/workout/${workouts[0].id}`);
      else if (dayKey(date) <= dayKey(new Date())) setLogDay(date);
    },
    [days, router]
  );

  const logOn = (source: string | null) => {
    const day = logDay;
    setLogDay(null);
    if (day) start(source, day);
  };

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader
        title={view}
        onTitlePress={() => setViewSheet(true)}
        right={
          <View style={styles.headerIcons}>
            <UploadSimple size={ICON_SIZES.xxl} color={COLORS.text} />
            <SlidersHorizontal size={ICON_SIZES.xxl} color={COLORS.text} style={styles.filterIcon} />
          </View>
        }
      />
      {days && profile && (
        <>
          {view === 'Month' && <MonthView days={days} profile={profile} onDay={openDay} bottomSpace={bottomSpace} />}
          {view === 'Year' && <YearView days={days} bottomSpace={bottomSpace} />}
          {view === 'Multi-year' && <MultiYearView days={days} />}
        </>
      )}

      <BottomSheet
        visible={logDay !== null}
        title={logDay ? `Log a workout on ${weekdayDate(logDay)}` : ''}
        onDismiss={() => setLogDay(null)}>
        <SheetItem first icon={<Plus {...sheetIcon} />} label="Empty Workout" onPress={() => logOn(null)} />
        {routines.map((r) => (
          <SheetItem key={r.id} icon={<ClipboardText {...sheetIcon} />} label={r.name} onPress={() => logOn(r.id)} />
        ))}
      </BottomSheet>
      {dialog}

      <BottomSheet visible={viewSheet} onDismiss={() => setViewSheet(false)}>
        {CALENDAR_VIEWS.map((v, i) => (
          <SheetOption
            key={v}
            first={i === 0}
            label={v}
            selected={v === view}
            onPress={() => {
              setView(v);
              setViewSheet(false);
            }}
          />
        ))}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SPACE.xl,
  },
  filterIcon: {
    marginLeft: SPACE.lg,
  },
});
