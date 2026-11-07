import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/theme';

// A full-width hairline between rows or under a title.
export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.separator,
  },
});
