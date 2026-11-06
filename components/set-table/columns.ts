import { StyleSheet } from 'react-native';
import { LOG_WORKOUT_SIZES, ROUTINE_EDITOR_SIZES } from '@/constants/sizes';
import type { SetTableLayout } from './types';

// The columns of a set table, in dp from the screen edge. Log Workout's
// boxes are moved left to make room for the ✓ column; the editors have none.
const LOG = StyleSheet.create({
  set: { position: 'absolute', left: LOG_WORKOUT_SIZES.setColLeft, width: LOG_WORKOUT_SIZES.setColWidth },
  previous: {
    position: 'absolute',
    left: LOG_WORKOUT_SIZES.previousColLeft,
    width: LOG_WORKOUT_SIZES.previousColWidth,
    textAlign: 'center',
  },
  middle: { position: 'absolute', left: LOG_WORKOUT_SIZES.middleColLeft, width: LOG_WORKOUT_SIZES.middleColWidth },
  right: { position: 'absolute', left: LOG_WORKOUT_SIZES.rightColLeft, width: LOG_WORKOUT_SIZES.rightColWidth },
  // A lone box (TIME) is wider.
  wide: { position: 'absolute', left: LOG_WORKOUT_SIZES.wideColLeft, width: LOG_WORKOUT_SIZES.wideColWidth },
  check: { position: 'absolute', left: LOG_WORKOUT_SIZES.checkColLeft, width: LOG_WORKOUT_SIZES.checkColWidth },
});

const EDITOR = StyleSheet.create({
  set: { position: 'absolute', left: ROUTINE_EDITOR_SIZES.setColLeft, width: ROUTINE_EDITOR_SIZES.setColWidth },
  previous: {
    position: 'absolute',
    left: ROUTINE_EDITOR_SIZES.previousColLeft,
    width: ROUTINE_EDITOR_SIZES.previousColWidth,
    textAlign: 'center',
  },
  middle: { position: 'absolute', left: ROUTINE_EDITOR_SIZES.middleColLeft, width: ROUTINE_EDITOR_SIZES.box },
  right: { position: 'absolute', left: ROUTINE_EDITOR_SIZES.rightColLeft, width: ROUTINE_EDITOR_SIZES.box },
  // A lone box keeps the right-hand slot's width here.
  wide: { position: 'absolute', left: ROUTINE_EDITOR_SIZES.rightColLeft, width: ROUTINE_EDITOR_SIZES.box },
  check: { display: 'none' },
});

export const SET_COLUMNS = { log: LOG, editor: EDITOR };

// The column of value box `index` when the set has `count` boxes (see slotsOf).
export function valueColumn(layout: SetTableLayout, index: number, count: number) {
  const c = SET_COLUMNS[layout];
  return index === 0 ? c.middle : count === 1 ? c.wide : c.right;
}
