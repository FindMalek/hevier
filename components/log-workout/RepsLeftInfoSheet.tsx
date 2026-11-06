import { StyleSheet, Text, View } from 'react-native';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import type { RepsLeftInfoSheetProps } from './types';

// The ⓘ next to "Reps left?": what it is and why it's asked.
export function RepsLeftInfoSheet({ visible, onDismiss }: RepsLeftInfoSheetProps) {
  return (
    <BottomSheet visible={visible} title="Reps left" onDismiss={onDismiss}>
      <View style={styles.body}>
        <Text style={styles.text}>How many more reps you could have done on your last set. 0 means you went to failure.</Text>
        <Text style={styles.text}>
          Without it, a set counts as a full hard set. Answer 4 or more and it counts less: it was easier.
        </Text>
        <Text style={styles.text}>Statistics use it for Sets (Below maintenance, Maintenance, Growth) and Recovery.</Text>
        <Text style={[styles.text, styles.note]}>Optional. Skip it when you went to failure or close.</Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: SPACE.lg,
    gap: SPACE.md,
  },
  text: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
  },
  note: {
    color: COLORS.textSecondary,
  },
});
