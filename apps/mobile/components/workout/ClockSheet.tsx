import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { BottomSheet } from "@/components/ui/BottomSheet";
import {
  adjustTimer,
  pauseTimer,
  pauseWatch,
  resetTimer,
  resetWatch,
  startTimer,
  startWatch,
  timerLeft,
  timerPaused,
  timerRunning,
  watchElapsed,
  watchRunning,
} from '@/lib/clock';
import { updateClock, useClock } from '@/stores/clockStore';
import { timerLabel, watchLabel } from "@/lib/format/duration";
import { COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, HIT_SLOPS, LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { CLOCK_SHEET_SIZES } from '@/constants/sizes';
import { CLOCK_TICKS } from '@/constants/motion';
import type { BigButtonProps, ButtonsProps, ClockSheetProps, StopwatchFaceProps, TimerFaceProps } from './types';

// The Clock sheet from the ⏰ on Log Workout: a timer and a stopwatch; while
// running, the ring empties, with Reset / Pause / Resume.

const R = (CLOCK_SHEET_SIZES.ring - CLOCK_SHEET_SIZES.stroke) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function ClockSheet({
  visible,
  onDismiss,
}: ClockSheetProps) {
  const clock = useClock();
  const running =
    clock.mode === "timer" ? timerRunning(clock) : watchRunning(clock);
  const now = useTicker(visible && running);

  return (
    <BottomSheet visible={visible} title="Clock" bare onDismiss={onDismiss}>
      <View style={styles.segments}>
        {(["timer", "stopwatch"] as const).map((m) => (
          <Pressable
            key={m}
            style={[styles.segment, clock.mode === m && styles.segmentOn]}
            onPress={() => updateClock((s) => ({ ...s, mode: m }))}
          >
            <Text style={styles.segmentLabel}>
              {m === "timer" ? "Timer" : "Stopwatch"}
            </Text>
          </Pressable>
        ))}
      </View>

      {clock.mode === "timer" ? (
        <TimerFace now={now} />
      ) : (
        <StopwatchFace now={now} />
      )}

      <Buttons now={now} />
    </BottomSheet>
  );
}

function TimerFace({ now }: TimerFaceProps) {
  const clock = useClock();
  const left = timerLeft(clock, now);
  const active = timerRunning(clock) || timerPaused(clock);
  // Full while idle; empties as the countdown runs.
  const share = active
    ? Math.min(1, left / Math.max(clock.timerSeconds * 1000, left))
    : 1;
  return (
    <View style={styles.faceRow}>
      <View style={styles.face}>
        <Svg width={CLOCK_SHEET_SIZES.ring} height={CLOCK_SHEET_SIZES.ring} style={StyleSheet.absoluteFill}>
          <Circle
            cx={CLOCK_SHEET_SIZES.ring / 2}
            cy={CLOCK_SHEET_SIZES.ring / 2}
            r={R}
            stroke={COLORS.separator}
            strokeWidth={CLOCK_SHEET_SIZES.stroke}
            fill="none"
          />
          <Circle
            cx={CLOCK_SHEET_SIZES.ring / 2}
            cy={CLOCK_SHEET_SIZES.ring / 2}
            r={R}
            stroke={COLORS.primary}
            strokeWidth={CLOCK_SHEET_SIZES.stroke}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={CIRCUMFERENCE * (1 - share)}
            strokeLinecap={share < 1 ? "round" : "butt"}
            transform={`rotate(-90 ${CLOCK_SHEET_SIZES.ring / 2} ${CLOCK_SHEET_SIZES.ring / 2})`}
          />
        </Svg>
        <Text style={styles.time}>{timerLabel(left)}</Text>
      </View>
      <Pressable
        style={[styles.adjust, styles.adjustLeft]}
        onPress={() => updateClock((s) => adjustTimer(s, -15, Date.now()))}
        hitSlop={HIT_SLOPS.xl}
      >
        <Text style={styles.adjustLabel}>-15s</Text>
      </Pressable>
      <Pressable
        style={[styles.adjust, styles.adjustRight]}
        onPress={() => updateClock((s) => adjustTimer(s, 15, Date.now()))}
        hitSlop={HIT_SLOPS.xl}
      >
        <Text style={styles.adjustLabel}>+15s</Text>
      </Pressable>
    </View>
  );
}

function StopwatchFace({ now }: StopwatchFaceProps) {
  const clock = useClock();
  return (
    <View style={[styles.face, styles.faceWide]}>
      <Text style={styles.time} numberOfLines={1}>{watchLabel(watchElapsed(clock, now))}</Text>
    </View>
  );
}

// Start; while running Reset / Pause; when paused Reset / Resume.
function Buttons({ now }: ButtonsProps) {
  const clock = useClock();
  const timer = clock.mode === "timer";
  const running = timer ? timerRunning(clock) : watchRunning(clock);
  const paused = timer
    ? timerPaused(clock)
    : !running && watchElapsed(clock, now) > 0;
  const start = () =>
    updateClock((s) =>
      timer ? startTimer(s, Date.now()) : startWatch(s, Date.now()),
    );
  const pause = () =>
    updateClock((s) =>
      timer ? pauseTimer(s, Date.now()) : pauseWatch(s, Date.now()),
    );
  const reset = () =>
    updateClock((s) => (timer ? resetTimer(s) : resetWatch(s)));

  if (!running && !paused) {
    return (
      <View style={styles.buttons}>
        <BigButton label="Start" onPress={start} />
      </View>
    );
  }
  return (
    <View style={styles.buttons}>
      <BigButton label="Reset" grey onPress={reset} />
      <BigButton
        label={running ? "Pause" : "Resume"}
        onPress={running ? pause : start}
      />
    </View>
  );
}

function BigButton({
  label,
  grey,
  onPress,
}: BigButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        grey && styles.buttonGrey,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={TYPE.bodyMedium}>{label}</Text>
    </Pressable>
  );
}

// Re-renders 4 times a second while something runs and the sheet is open.
function useTicker(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), CLOCK_TICKS.clockSheetTickMs);
    return () => clearInterval(t);
  }, [active]);
  // Idle faces don't depend on the time, so the last tick is fine then.
  return now;
}

const styles = StyleSheet.create({
  // Timer / Stopwatch: 50 tall, 16 under the divider, outlined; the open one blue.
  segments: {
    height: CLOCK_SHEET_SIZES.segmentsHeight,
    marginTop: SPACE.lg,
    marginHorizontal: LAYOUT.screenMargin,
    padding: SPACE.xs,
    borderRadius: RADIUS.xl,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: COLORS.separator,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentOn: {
    backgroundColor: COLORS.primary,
  },
  segmentLabel: {
    ...TYPE.bodyMedium,
  },
  // The 240 ring, 31 under the switch; the time in its middle.
  face: {
    width: CLOCK_SHEET_SIZES.ring,
    height: CLOCK_SHEET_SIZES.ring,
    marginTop: SPACE.xxl,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    ...TYPE.clock,
    color: COLORS.text,
    fontVariant: ["tabular-nums"],
  },
  // The stopwatch has no ring: "00:00:00" uses the full width (clock-stopwatch.jpg).
  faceWide: {
    width: undefined,
    alignSelf: 'stretch',
  },
  faceRow: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  // -15s / +15s near the ring's lower corners, 32 from the screen edges.
  adjust: {
    position: "absolute",
    bottom: CLOCK_SHEET_SIZES.adjustBottom,
  },
  adjustLeft: {
    left: CLOCK_SHEET_SIZES.adjustLeftLeft,
  },
  adjustRight: {
    right: CLOCK_SHEET_SIZES.adjustRightRight,
  },
  adjustLabel: {
    ...TYPE.rowMedium,
    color: COLORS.primary,
  },
  buttons: {
    flexDirection: "row",
    gap: SPACE.lg,
    marginTop: SPACE.xxl,
    marginHorizontal: LAYOUT.screenMargin,
    marginBottom: SPACE.lg,
  },
  button: {
    flex: 1,
    height: CLOCK_SHEET_SIZES.buttonHeight,
    borderRadius: RADIUS.button,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  buttonGrey: {
    backgroundColor: COLORS.separator,
  },
  pressed: {
    opacity: 0.8,
  },
});
