import { StyleSheet } from 'react-native';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';

// Styles used by the page and its pieces.
export const shared = StyleSheet.create({
  // Grey section title: "Muscle Split", "Workout".
  section: {
    marginTop: SPACE.lg,
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: SPACE.md,
    backgroundColor: COLORS.separator,
  },
});
