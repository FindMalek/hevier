import { StyleSheet, Text, View } from 'react-native';

import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { SIZES, STATISTICS_SIZES } from '@/constants/sizes';
import { weekdayLetter } from '@/lib/format/date';
import type { SevenDayStripProps } from './types';

// The Statistics page's last 7 days: a tile per day, its date in a blue circle
// when trained, a dot under today's.
export function SevenDayStrip({ days }: SevenDayStripProps) {
  return (
    <View style={styles.days}>
      {days.map((d, i) => (
        <View key={d.date.getTime()} style={styles.day}>
          <Text style={styles.dayLetter}>{weekdayLetter(d.date)}</Text>
          <View style={[styles.dayCircle, d.trained && styles.dayCircleOn]}>
            <Text style={[styles.dayNumber, d.trained && styles.dayNumberOn]}>{d.date.getDate()}</Text>
            {i === days.length - 1 && <View style={[styles.today, d.trained && styles.todayOn]} />}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Seven tiles across, 47 wide, 59 tall.
  days: {
    marginTop: SPACE.lg,
    marginHorizontal: LAYOUT.screenMargin,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    width: STATISTICS_SIZES.dayWidth,
    height: STATISTICS_SIZES.dayHeight,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  // Marks today (the last tile) under its date; white on a blue circle.
  today: {
    position: 'absolute',
    bottom: STATISTICS_SIZES.todayBottom,
    width: STATISTICS_SIZES.todayWidth,
    height: STATISTICS_SIZES.todayHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  todayOn: {
    backgroundColor: COLORS.text,
  },
  dayLetter: {
    marginTop: SPACE.xs,
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  dayCircle: {
    width: SIZES.dayCircle,
    height: SIZES.dayCircle,
    marginTop: SPACE.xxs,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleOn: {
    backgroundColor: COLORS.primary,
  },
  dayNumber: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  dayNumberOn: {
    color: COLORS.text,
  },
});
