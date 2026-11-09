import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { SPACE } from '@/constants/layout';
import type { DataWaitingProps } from './types';

// Shown instead of the app while data from an interrupted restore can't be
// put back yet (hooks/useDataWaiting.ts): nothing is lost, and Try again
// asks once more.
export function DataWaiting({ message, trying, onRetry }: DataWaitingProps) {
  return (
    <Screen style={styles.waiting}>
      <StatusBar style="light" />
      <EmptyState
        title="Your data is waiting"
        message={message}
        action={<Button label="Try again" busy={trying} onPress={onRetry} style={styles.retry} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  waiting: { justifyContent: 'center', paddingHorizontal: SPACE.xl },
  retry: { marginTop: SPACE.xl, alignSelf: 'stretch' },
});
