import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Play } from 'phosphor-react-native/src/icons/Play';

import { updateActiveWorkout, useNow } from '@/stores/activeWorkoutStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { elapsedLabel, pad2 } from '@/lib/format/duration';
import { WheelPicker } from '@/components/ui/WheelPicker';
import { COLORS, TYPE } from '@/constants/theme';
import { elapsedSeconds, pauseTimer, resumeTimer, setDuration, setStartTime } from '@/lib/workout/activeWorkout';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { DURATION_SHEET_SIZES, ICON_SIZES } from '@/constants/sizes';
import { DURATION_SHEET_LIMITS } from '@/constants/limits';
import { daysBetween, startOfDay } from '@/lib/date';
import { dateTimeLabel, fullDate } from '@/lib/format/date';
import type { DurationSheetProps, StartWheelsProps, TimeSheetProps } from './types';

// Tapping Duration on Log Workout:
// Duration and Start time rows, each opening its wheel, and Pause Workout Timer.
// Moving one wheel changes the other value, since Duration = now − Start time.
// `TimeSheet` is the same sheet for any workout (Edit Workout keeps the
// duration when the start moves); `DurationSheet` wires it to the live one.

const MINUTES = Array.from({ length: DURATION_SHEET_LIMITS.maxMinutes + 1 }, (_, m) =>
  m < 60 ? `${m}min` : `${Math.floor(m / 60)}h ${m % 60}min`
);
const HOURS = Array.from({ length: 24 }, (_, h) => pad2(h));
const MINUTES_OF_HOUR = Array.from({ length: 60 }, (_, m) => pad2(m));

// The date wheel's days, `daysBack` before today to today, each at midnight.
// Built from the calendar date, not by taking 24h steps off today, which lands
// on 23:00 the day before once a clock change is crossed.
function wheelDays(today: number, daysBack: number) {
  const t = new Date(today);
  return Array.from(
    { length: daysBack + 1 },
    (_, i) => new Date(t.getFullYear(), t.getMonth(), t.getDate() - (daysBack - i))
  );
}

// Ticks by itself, and only while open, so its screen needn't.
export function DurationSheet({
  workout,
  visible,
  onDismiss,
  noPause,
}: DurationSheetProps) {
  const now = useNow(visible);
  const paused = !!workout.pausedAt;
  const pauseButton = (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={() => updateActiveWorkout((w) => (w.pausedAt ? resumeTimer(w, Date.now()) : pauseTimer(w, Date.now())))}>
      {paused ? (
        <Play size={ICON_SIZES.sm} weight="fill" color={COLORS.text} />
      ) : (
        // Pause sign: two thin bars.
        <View style={styles.pauseIcon}>
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </View>
      )}
      <Text style={styles.buttonLabel}>{paused ? 'Resume Workout Timer' : 'Pause Workout Timer'}</Text>
    </Pressable>
  );
  return (
    <TimeSheet
      visible={visible}
      onDismiss={onDismiss}
      now={now}
      startTime={Date.parse(workout.startTime)}
      durationSeconds={elapsedSeconds(workout, now)}
      onStart={(t) => updateActiveWorkout((w) => setStartTime(w, t, Date.now()))}
      onDuration={(seconds) => updateActiveWorkout((w) => setDuration(w, seconds, Date.now()))}
      // A workout logged for a past day has no running clock to pause.
      footer={workout.backdated || noPause ? undefined : pauseButton}
    />
  );
}

export function TimeSheet({
  visible,
  onDismiss,
  now,
  startTime,
  durationSeconds,
  onStart,
  onDuration,
  footer,
}: TimeSheetProps) {
  const [open, setOpen] = useState<'duration' | 'start' | null>(null);
  const elapsed = durationSeconds;
  const start = new Date(startTime);

  return (
    <BottomSheet
      visible={visible}
      title="Duration"
      bare
      onDismiss={onDismiss}
      onClosed={() => setOpen(null)}>
      <Pressable style={[styles.row, styles.first]} onPress={() => setOpen(open === 'duration' ? null : 'duration')}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{elapsedLabel(elapsed)}</Text>
      </Pressable>
      {open === 'duration' && (
        <View style={styles.wheels}>
          <WheelPicker
            items={MINUTES}
            index={Math.min(DURATION_SHEET_LIMITS.maxMinutes, Math.floor(elapsed / 60))}
            width={179}
            onChange={(m) => onDuration(m * 60)}
          />
        </View>
      )}

      <Pressable style={styles.row} onPress={() => setOpen(open === 'start' ? null : 'start')}>
        <Text style={styles.label}>Start time</Text>
        <Text style={styles.value}>{dateTimeLabel(start)}</Text>
      </Pressable>
      {open === 'start' && <StartWheels now={now} startTime={startTime} onStart={onStart} />}

      {footer ?? <View style={styles.noFooter} />}
    </BottomSheet>
  );
}

// Only built while open: a year of days and their labels.
function StartWheels({
  now,
  startTime,
  onStart,
}: StartWheelsProps) {
  const start = new Date(startTime);
  // Days on the date wheel: a year back (or back to the start, if older), today last.
  const today = startOfDay(new Date(now)).getTime();
  const daysBack = Math.max(DURATION_SHEET_LIMITS.daysBack, daysBetween(startTime, today));
  const days = useMemo(() => wheelDays(today, daysBack), [today, daysBack]);
  const labels = useMemo(() => days.map(fullDate), [days]);
  const dayIndex = Math.max(0, daysBack - daysBetween(startTime, today));

  function pickStart(day: number, hour: number, minute: number) {
    const d = new Date(days[day]);
    d.setHours(hour, minute, 0, 0);
    onStart(d.getTime());
  }

  return (
    <View style={[styles.wheels, styles.startWheels]}>
      <WheelPicker
        items={labels}
        index={dayIndex}
        flex={1}
        onChange={(i) => pickStart(i, start.getHours(), start.getMinutes())}
      />
      <WheelPicker
        items={HOURS}
        index={start.getHours()}
        width={64}
        onChange={(h) => pickStart(dayIndex, h, start.getMinutes())}
      />
      <Text style={styles.colon}>:</Text>
      <WheelPicker
        items={MINUTES_OF_HOUR}
        index={start.getMinutes()}
        width={64}
        onChange={(m) => pickStart(dayIndex, start.getHours(), m)}
      />
    </View>
  );
}

// Measured on the 946px-wide duration screenshots (2.3 px per dp).
const styles = StyleSheet.create({
  row: {
    height: DURATION_SHEET_SIZES.rowHeight,
    marginHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  first: {
    marginTop: SPACE.lg,
  },
  label: {
    ...TYPE.body,
  },
  value: {
    ...TYPE.body,
    color: COLORS.primary,
  },
  // 24dp around a wheel; Start time's wheel has 33dp under it, to the button.
  wheels: {
    alignItems: 'center',
    marginVertical: SPACE.xl,
  },
  startWheels: {
    flexDirection: 'row',
    marginHorizontal: LAYOUT.screenMargin,
    marginBottom: SPACE.xl,
    gap: SPACE.lg,
  },
  colon: {
    ...TYPE.heading,
  },
  button: {
    height: DURATION_SHEET_SIZES.buttonHeight,
    marginTop: SPACE.sm,
    marginHorizontal: LAYOUT.screenMargin,
    marginBottom: 84,
    borderRadius: RADIUS.button,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.md,
    backgroundColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  noFooter: {
    height: DURATION_SHEET_SIZES.noFooterHeight,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: SPACE.xs,
  },
  pauseBar: {
    width: DURATION_SHEET_SIZES.pauseBarWidth,
    height: DURATION_SHEET_SIZES.pauseBarHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.text,
  },
  buttonLabel: {
    ...TYPE.bodyMedium,
  },
});
