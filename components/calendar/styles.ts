import { StyleSheet } from 'react-native';

import { TYPE } from '@/constants/theme';

// Styles used by more than one view.
export const shared = StyleSheet.create({
  yearTitle: {
    ...TYPE.headlineSemibold,
  },
});
