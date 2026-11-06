import { StyleSheet } from 'react-native';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { STATISTICS_DISTRIBUTION_SIZES } from '@/constants/sizes';

// The distribution cards (StatCard, PushPullCard): two 181×97.5 cards a row, a #2C2C2E border.
export const cardStyles = StyleSheet.create({
  card: {
    width: '47.8%',
    height: STATISTICS_DISTRIBUTION_SIZES.cardHeight,
    paddingTop: SPACE.lg,
    paddingHorizontal: SPACE.lg,
    borderWidth: BORDER_WIDTHS.hairline,
    borderRadius: RADIUS.card,
    borderColor: COLORS.separator,
  },
  cardTitle: {
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
  },
  cardValue: {
    marginTop: SPACE.xxs,
    ...TYPE.titleSemibold,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
});
