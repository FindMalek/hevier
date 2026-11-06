import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check } from 'phosphor-react-native/src/icons/Check';
import { Play } from 'phosphor-react-native/src/icons/Play';
import { Stop } from 'phosphor-react-native/src/icons/Stop';
import { useNow } from '@/stores/activeWorkoutStore';
import { Medal } from '@/components/workout/PrToast';
import { SwipeToDelete } from '@/components/ui/SwipeToDelete';
import { SetBadge } from '@/components/set-table/SetBadge';
import { PreviousCell, SetInputs } from '@/components/set-table/SetInputs';
import { SET_COLUMNS } from '@/components/set-table/columns';
import { COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, HIT_SLOPS, RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, LOG_WORKOUT_SIZES, SIZES } from '@/constants/sizes';
import { clock } from '@/lib/format/duration';
import { secondsUntil } from '@/lib/date';
import type { SetRowProps, SetTimerTextProps } from './types';

// One set: memo, so typing in it doesn't redraw the exercise's other sets.
// Each set is a 47.2dp band; a done set turns the whole band green.
export const SetRow = memo(function SetRow({
  exerciseKey,
  type,
  set,
  badge,
  previous,
  perHand,
  medal,
  showPlay,
  timerEndsAt,
  actions,
}: SetRowProps) {
  const timing = timerEndsAt !== null;
  return (
    <SwipeToDelete rowStyle={[styles.row, set.done && styles.rowDone]} onDelete={() => actions.deleteSet(exerciseKey, set.key)}>
      <View style={styles.inner}>
        <Pressable
          style={[styles.setBox, SET_COLUMNS.log.set, set.done && styles.setBoxDone]}
          onPress={() => actions.setMenu(exerciseKey, set.key)}>
          {medal ? <Medal /> : <SetBadge setType={set.setType} label={badge} />}
        </Pressable>
        <PreviousCell type={type} previous={previous} perHand={perHand} layout="log" />
        {showPlay && (
          <Pressable
            style={styles.play}
            // Empty box: last session's time.
            onPress={() => (timing ? actions.stop() : actions.play(set.key, set.time || clock(previous?.durationSeconds ?? null)))}
            hitSlop={HIT_SLOPS.md}>
            {timing ? (
              <Stop size={ICON_SIZES.xxs} weight="fill" color={COLORS.primary} />
            ) : (
              <Play size={ICON_SIZES.xxs} weight="fill" color={COLORS.primary} style={styles.playIcon} />
            )}
          </Pressable>
        )}
        <SetInputs
          type={type}
          set={set}
          perHand={perHand}
          layout="log"
          done={set.done}
          timer={timing ? <SetTimerText endsAt={timerEndsAt} /> : undefined}
          onChange={(change) => actions.setChange(exerciseKey, set.key, change)}
        />
        <Pressable
          style={[styles.checkBox, SET_COLUMNS.log.check, set.done && styles.checkBoxDone]}
          onPress={() => actions.toggleDone(exerciseKey, set.key)}
          hitSlop={HIT_SLOPS.xs}>
          <Check size={ICON_SIZES.lg} weight={set.done ? 'bold' : 'regular'} color={set.done ? COLORS.text : COLORS.textSecondary} />
        </Pressable>
      </View>
    </SwipeToDelete>
  );
});

// A ▶ countdown in place of the TIME box.
function SetTimerText({ endsAt }: SetTimerTextProps) {
  const now = useNow();
  return <Text style={styles.timerText}>{clock(secondsUntil(endsAt, now))}</Text>;
}

const styles = StyleSheet.create({
  row: {
    height: LOG_WORKOUT_SIZES.setRowHeight,
    backgroundColor: COLORS.background,
  },
  rowDone: {
    backgroundColor: COLORS.doneRow,
  },
  inner: {
    marginTop: SPACE.xs,
    height: SIZES.setRowHeight,
  },
  setBox: {
    height: SIZES.setRowHeight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  setBoxDone: {
    backgroundColor: 'transparent',
  },
  // ▶ beside a lone TIME box: a 24dp blue ring at 217.9.
  play: {
    position: 'absolute',
    left: LOG_WORKOUT_SIZES.playLeft,
    top: LOG_WORKOUT_SIZES.playTop,
    width: LOG_WORKOUT_SIZES.playWidth,
    height: LOG_WORKOUT_SIZES.playHeight,
    borderRadius: RADIUS.round,
    borderWidth: BORDER_WIDTHS.thin,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: SPACE.xxs,
  },
  timerText: {
    ...TYPE.bodySemibold,
    color: COLORS.primary,
  },
  // A completed set shows plain bold numbers on the green row.
  checkBox: {
    height: SIZES.setRowHeight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.separator,
  },
  checkBoxDone: {
    backgroundColor: COLORS.done,
  },
});
