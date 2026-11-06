import { ScrollView, StyleSheet } from 'react-native';
import { BottomSheet, SheetOption } from '@/components/ui/BottomSheet';
import { REST_CHOICES } from '@/constants/training';
import { REST_TIMER_SHEET_SIZES } from '@/constants/sizes';
import { restLabel } from '@/lib/format/duration';
import type { RestTimerSheetProps } from './types';

// The list of rest times (Off, 5s … 5min), the current one ticked.
export function RestTimerSheet({ visible, title, value, onPick, onDismiss }: RestTimerSheetProps) {
  return (
    <BottomSheet visible={visible} title={title} onDismiss={onDismiss}>
      <ScrollView style={styles.list}>
        {REST_CHOICES.map((seconds, i) => (
          <SheetOption
            key={i}
            first={i === 0}
            label={restLabel(seconds)}
            selected={value === seconds}
            onPress={() => {
              onPick(seconds);
              onDismiss();
            }}
          />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: REST_TIMER_SHEET_SIZES.listMaxHeight,
  },
});
