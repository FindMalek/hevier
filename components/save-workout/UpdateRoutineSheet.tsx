import { StyleSheet, Text, View } from 'react-native';
import { ClipboardText } from 'phosphor-react-native/src/icons/ClipboardText';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { ICON_SIZES, SAVE_WORKOUT_SIZES } from '@/constants/sizes';
import type { UpdateRoutineSheetProps } from './types';

// The "Update routine" sheet: the workout was done
// differently from its routine; Update Routine makes the routine what was done,
// Keep Original saves the workout alone.
export function UpdateRoutineSheet({ update, onUpdate, onKeep, onDismiss }: UpdateRoutineSheetProps) {
  return (
    <BottomSheet visible={update !== null} onDismiss={onDismiss} bare>
      <View style={styles.update}>
        <ClipboardText size={ICON_SIZES.illustration} weight="thin" color={COLORS.text} />
        <Text style={styles.updateTitle}>Update &quot;{update?.routine.name}&quot;</Text>
        <Text style={styles.updateText}>{update?.message}</Text>
        <Button
          label="Update Routine"
          style={[styles.updateButton, styles.updatePrimary]}
          onPress={() => update && onUpdate(update.routine)}
        />
        <Button label="Keep Original Routine" variant="secondary" style={[styles.updateButton, styles.updateKeep]} onPress={onKeep} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  update: {
    alignItems: 'center',
    paddingTop: SPACE.lg,
    paddingHorizontal: LAYOUT.screenMargin,
    paddingBottom: SPACE.sm,
  },
  updateTitle: {
    marginTop: SPACE.lg,
    ...TYPE.headingBold,
  },
  updateText: {
    marginTop: SPACE.sm,
    ...TYPE.body,
    textAlign: 'center',
  },
  updateButton: {
    alignSelf: 'stretch',
    height: SAVE_WORKOUT_SIZES.updateButtonHeight,
  },
  updatePrimary: {
    marginTop: SPACE.xl,
  },
  updateKeep: {
    marginTop: SPACE.lg,
  },
});
