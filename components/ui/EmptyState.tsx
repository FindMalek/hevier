import { StyleSheet, Text, View } from 'react-native';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import type { EmptyStateProps } from './types';

// What a list or section shows when it has nothing in it.
export function EmptyState({ message, title, icon, action, note, style }: EmptyStateProps) {
  if (note) {
    return (
      <View style={style}>
        <Text style={styles.note}>{message}</Text>
      </View>
    );
  }
  const below = icon || title;
  return (
    <View style={[styles.block, style]}>
      {icon}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={[styles.message, below ? styles.belowTitle : null]}>{message}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: SPACE.xl,
    alignItems: 'center',
  },
  title: {
    ...TYPE.rowSemibold,
  },
  message: {
    textAlign: 'center',
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
  belowTitle: {
    marginTop: SPACE.md,
  },
  note: {
    marginTop: SPACE.lg,
    ...TYPE.callout,
    color: COLORS.textSecondary,
  },
});
