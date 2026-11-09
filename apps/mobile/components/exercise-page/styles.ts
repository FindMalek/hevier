import { StyleSheet } from 'react-native';

import { LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';

// Styles used by more than one tab.
export const shared = StyleSheet.create({
  body: {
    paddingHorizontal: LAYOUT.screenMargin,
  },
  name: {
    marginTop: SPACE.lg,
    ...TYPE.headingSemibold,
    lineHeight: LINE_HEIGHTS.loose,
  },
});
