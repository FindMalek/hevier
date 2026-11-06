import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { PULL_HEAVY_RATIO, PUSH_HEAVY_RATIO, PUSH_PULL_BALANCED_RATIO, RADAR_EDGE_SETS } from '@/constants/training';
import type { DistributionInfoSheetProps } from './types';

// The ? sheet: what the radar, the cards and Push / Pull count.
export function DistributionInfoSheet({ visible, onDismiss }: DistributionInfoSheetProps) {
  return (
    <BottomSheet visible={visible} title="Muscle Distribution" onDismiss={onDismiss}>
      <View style={styles.infoBody}>
        <Text style={styles.infoText}>
          Sets per week for each muscle. Sets close to failure count fully, easy sets count less, and a
          muscle that only helps in an exercise counts half a set.
        </Text>
        <Text style={styles.infoText}>
          Blue is this period, the dashed line the one before. The outer ring is {RADAR_EDGE_SETS} sets a
          week. Tap a muscle to see its numbers.
        </Text>
        <Text style={styles.infoText}>The Sets card counts every set, warm-ups included.</Text>
        <Text style={styles.infoText}>
          Push / Pull counts every set of presses, dips, push-ups, flyes and front raises against rows,
          pulldowns, pull-ups, face pulls, rear delt flyes and Y raises, in sets a week. Arm work is shown
          apart. Within {Math.round((PUSH_PULL_BALANCED_RATIO - 1) * 100)}% is Balanced, and a bit more pull
          is fine: most coaches aim for at least as much pull as push. A warning shows when push goes past{' '}
          {PUSH_HEAVY_RATIO}× pull, or pull past {PULL_HEAVY_RATIO}× push.
        </Text>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  infoBody: {
    padding: SPACE.lg,
    paddingBottom: SPACE.lg,
    gap: SPACE.md,
  },
  infoText: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
  },
});
