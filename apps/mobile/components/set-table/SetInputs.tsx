import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useSelectAllOnFocus } from '@/hooks/useSelectAllOnFocus';
import { COLORS, FONTS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS } from '@/constants/layout';
import { SET_TABLE_SIZES, SIZES } from '@/constants/sizes';
import { SET_FIELDS } from '@/constants/setFields';
import { WeightInput } from '@/components/workout/WeightInput';
import { previousLabel, typeClock } from '@/lib/format/setFormat';
import { SET_COLUMNS, valueColumn } from './columns';
import { slotsOf } from './fields';
import type { PreviousCellProps, SetInputsProps } from './types';

// The PREVIOUS column of a set: last session's set, grey.
export function PreviousCell({
  type,
  previous,
  perHand,
  layout,
}: PreviousCellProps) {
  return (
    <Text style={[styles.previous, SET_COLUMNS[layout].previous]} numberOfLines={1}>
      {previousLabel(type, previous, perHand)}
    </Text>
  );
}

// A REPS / KM / TIME box: what's in it is selected on tap (useSelectAllOnFocus).
function SetTextBox(props: TextInputProps & { value: string }) {
  const { ref, onFocus } = useSelectAllOnFocus(props.value);
  return <TextInput {...props} ref={ref} onFocus={onFocus} />;
}

// The value boxes of one set (KG and REPS, KM and TIME, …), in their columns.
// Not memo: the set row around it is, so typing redraws only that row.
export function SetInputs({ type, set, perHand, layout, done, timer, onChange }: SetInputsProps) {
  const fields = SET_FIELDS[type];
  return (
    <>
      {slotsOf(fields).map((f, i) => {
        if (!f) return null;
        const column = valueColumn(layout, i, fields.length);
        if (f.field === 'time' && timer) {
          return (
            <View key={f.field} style={[styles.input, column, styles.timer]}>
              {timer}
            </View>
          );
        }
        if (f.field === 'weight') {
          return (
            <WeightInput
              key={f.field}
              style={[styles.input, column, done && styles.done]}
              value={set.weight}
              perHand={perHand}
              onChangeText={(weight) => onChange({ weight })}
              keyboardType="decimal-pad"
              placeholder="-"
              placeholderTextColor={COLORS.textSecondary}
              selectionColor={COLORS.primary}
              cursorColor={COLORS.primary}
            />
          );
        }
        return (
          <SetTextBox
            key={f.field}
            style={[styles.input, column, done && styles.done]}
            value={set[f.field]}
            onChangeText={(text) => onChange({ [f.field]: f.field === 'time' ? typeClock(text) : text })}
            keyboardType={f.field === 'time' || f.field === 'reps' ? 'number-pad' : 'decimal-pad'}
            placeholder={f.field === 'time' ? '00:00' : '-'}
            placeholderTextColor={COLORS.textSecondary}
            selectionColor={COLORS.primary}
            cursorColor={COLORS.primary}
          />
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  previous: {
    top: SET_TABLE_SIZES.previousTop,
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  input: {
    height: SIZES.inputHeight,
    top: SET_TABLE_SIZES.inputTop,
    padding: 0,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: COLORS.separator,
    borderRadius: RADIUS.md,
    textAlign: 'center',
    ...TYPE.body,
  },
  // A ticked set: no border, bold.
  done: {
    borderColor: 'transparent',
    fontFamily: FONTS.semibold,
  },
  timer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.primary,
  },
});
