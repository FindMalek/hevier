import { DarkTheme } from 'expo-router';

import { COLORS } from '@/constants/theme';

// The navigation library's dark theme in the app's colours (headers, screen
// backgrounds behind transitions).
export const NAVIGATION_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.surface,
  },
};

