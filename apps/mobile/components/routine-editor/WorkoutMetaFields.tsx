import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Divider } from '@/components/ui/Divider';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { ROUTINE_EDITOR_SIZES } from '@/constants/sizes';
import { elapsedLabel } from '@/lib/format/duration';
import { weekdayDateTime } from '@/lib/format/date';
import type { WorkoutMetaFieldsProps } from './types';

// Edit Workout only: Start and Duration (they open the Log Workout duration
// wheels) and the description.
export function WorkoutMetaFields({ meta, onTime, onDescription }: WorkoutMetaFieldsProps) {
  return (
    <>
      <Pressable style={styles.row} onPress={onTime}>
        <Text style={styles.label}>Start</Text>
        <Text style={styles.value}>{meta.startTime ? weekdayDateTime(new Date(meta.startTime)) : ''}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={onTime}>
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{elapsedLabel(meta.durationSeconds)}</Text>
      </Pressable>
      <TextInput
        style={styles.description}
        value={meta.description}
        onChangeText={onDescription}
        placeholder="Description"
        placeholderTextColor={COLORS.textSecondary}
        selectionColor={COLORS.primary}
        cursorColor={COLORS.primary}
        multiline
      />
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    height: ROUTINE_EDITOR_SIZES.whenRowHeight,
    paddingHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...TYPE.body,
  },
  value: {
    ...TYPE.body,
    color: COLORS.primary,
  },
  description: {
    paddingHorizontal: LAYOUT.screenMargin,
    paddingVertical: SPACE.md,
    ...TYPE.body,
  },
});
