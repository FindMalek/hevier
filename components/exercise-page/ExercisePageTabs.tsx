import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { EXERCISE_PAGE_TABS } from '@/constants/exercise';
import { EXERCISE_TAB_LABELS } from '@/constants/labels';
import { EXERCISE_PAGE_SIZES } from '@/constants/sizes';
import type { ExercisePageTabsProps } from './types';

// Summary / History / How to: thirds of the width under the header, grey,
// a 3dp blue line under the open one.
export function ExercisePageTabs({ tab, onTab }: ExercisePageTabsProps) {
  return (
    <View style={styles.tabs}>
      {EXERCISE_PAGE_TABS.map((key) => (
        <Pressable key={key} style={styles.tab} onPress={() => onTab(key)}>
          <Text style={[styles.tabLabel, tab === key && styles.tabLabelOn]}>{EXERCISE_TAB_LABELS[key]}</Text>
          {tab === key && <View style={styles.tabLine} />}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
  },
  tab: {
    flex: 1,
    height: EXERCISE_PAGE_SIZES.tabHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  tabLabelOn: {
    color: COLORS.primary,
  },
  tabLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: EXERCISE_PAGE_SIZES.tabLineHeight,
    backgroundColor: COLORS.primary,
  },
});
