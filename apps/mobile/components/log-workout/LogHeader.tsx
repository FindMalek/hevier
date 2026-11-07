import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alarm } from 'phosphor-react-native/src/icons/Alarm';
import { CaretDown } from 'phosphor-react-native/src/icons/CaretDown';
import { timerRunning, watchRunning } from '@/lib/clock';
import { useClock } from '@/stores/clockStore';
import { HeaderPillButton } from '@/components/ui/InnerHeader';
import { COLORS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, SPACE } from '@/constants/layout';
import { ICON_SIZES, LOG_WORKOUT_SIZES } from '@/constants/sizes';
import { monthDay } from '@/lib/format/date';
import type { LogHeaderProps } from './types';

// ⌄ Log Workout (and the day, when logged afterwards) · ⏰ · Finish, and the
// blue line of sets completed under it.
export function LogHeader({ workout, progress, onBack, onClock, onFinish }: LogHeaderProps) {
  const insets = useSafeAreaInsets();
  const clock = useClock();
  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable style={styles.minimize} onPress={onBack} hitSlop={HIT_SLOPS.md}>
          <CaretDown size={ICON_SIZES.xl} color={COLORS.text} />
          <Text style={styles.title}>Log Workout</Text>
          {/* Logged afterwards from the calendar: which day it goes on. */}
          {workout.backdated && <Text style={styles.day}>{monthDay(new Date(workout.startTime))}</Text>}
        </Pressable>
        <View style={styles.right}>
          {/* The Clock sheet (Timer / Stopwatch); blue while one runs. */}
          <Pressable style={styles.clockButton} onPress={onClock} hitSlop={HIT_SLOPS.md}>
            <Alarm size={ICON_SIZES.xxl} color={timerRunning(clock) || watchRunning(clock) ? COLORS.primary : COLORS.text} />
          </Pressable>
          <HeaderPillButton label="Finish" onPress={onFinish} />
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: SPACE.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // ⏰ centred 28 left of Finish (log-workout-top.jpg).
  clockButton: {
    marginRight: SPACE.lg,
  },
  minimize: {
    height: LOG_WORKOUT_SIZES.minimizeHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACE.lg,
  },
  title: {
    marginLeft: SPACE.sm,
    ...TYPE.row,
  },
  day: {
    marginLeft: SPACE.sm,
    ...TYPE.row,
    color: COLORS.primary,
  },
  progressTrack: {
    height: LOG_WORKOUT_SIZES.progressTrackHeight,
    backgroundColor: COLORS.separator,
  },
  progressFill: {
    height: LOG_WORKOUT_SIZES.progressFillHeight,
    backgroundColor: COLORS.primary,
  },
});
