import { StyleSheet } from 'react-native';
import { LAYOUT, SPACE } from '@/constants/layout';

// Styles shared by the scrolling screens.
export const SCREEN_STYLES = StyleSheet.create({
  // A ScrollView's contentContainerStyle: the side margins, and room under the last item.
  content: {
    paddingHorizontal: LAYOUT.screenMargin,
    paddingBottom: SPACE.xxxl,
  },
});
