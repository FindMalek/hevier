import { StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/theme';
import type { ScreenProps } from './types';

// The black page every screen sits on.
export function Screen({ style, ...rest }: ScreenProps) {
  return <View style={[styles.screen, style]} {...rest} />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
