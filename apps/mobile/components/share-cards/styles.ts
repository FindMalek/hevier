import { StyleSheet } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';

// Styles used by more than one card file.
export const shared = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.xs,
  },
  count: {
    color: COLORS.primary,
  },
  listMore: {
    ...TYPE.small,
  },
});
