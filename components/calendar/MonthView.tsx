import { memo, useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Fire } from 'phosphor-react-native/src/icons/Fire';
import { Moon } from 'phosphor-react-native/src/icons/Moon';

import { COLORS, TYPE } from '@/constants/theme';
import { BORDER_WIDTHS, RADIUS, SPACE } from '@/constants/layout';
import { CALENDAR_SIZES, ICON_SIZES, SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import { WEEKDAY_NAMES } from '@/constants/time';
import { dayCellTitle, monthsSince, monthWeeks, restDays } from '@/lib/calendar';
import { dayKey } from '@/lib/date';
import { monthYear } from '@/lib/format/date';
import { streakWeeks } from '@/lib/stats/profileCharts';
import type { MonthItem, MonthProps, MonthViewProps } from './types';

function monthKey(m: MonthItem) {
  return `${m.year}-${m.month}`;
}

// One month: week rows of day circles, a workout day blue with its name under it.
const Month = memo(function Month({ year, month, days, onDay }: MonthProps) {
  const title = monthYear(new Date(year, month, 1));
  const today = dayKey(new Date());
  return (
    <View style={styles.month}>
      <Text style={styles.monthTitle}>{title}</Text>
      {monthWeeks(year, month).map((week, w) => {
        const first = week.findIndex((d) => d);
        const last = 6 - [...week].reverse().findIndex((d) => d);
        return (
          <View key={w} style={styles.week}>
            {/* The line over a week spans only that week's days. */}
            <View style={[styles.weekLine, { left: `${(first / 7) * 100}%`, right: `${((6 - last) / 7) * 100}%` }]} />
            {week.map((date, i) => {
              const key = date ? dayKey(date) : '';
              const workouts = date ? days.get(key) : undefined;
              // Future days can't be logged.
              return (
                <Pressable key={i} style={styles.day} disabled={!date || key > today} onPress={() => date && onDay(date)}>
                  {date && (
                    <>
                      <View
                        style={[
                          styles.dayCircle,
                          workouts && styles.dayCircleOn,
                          key === today && (workouts ? styles.todayOn : styles.today),
                        ]}>
                        <Text style={[styles.dayNumber, key === today && !workouts && styles.todayNumber]}>
                          {date.getDate()}
                        </Text>
                      </View>
                      {workouts && (
                        <Text style={styles.dayLabel} numberOfLines={1} ellipsizeMode="clip">
                          {dayCellTitle(workouts[0].title)}
                        </Text>
                      )}
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
});

// The streak / rest days bar, the weekday names, then every month since the
// first workout, newest at the bottom.
export function MonthView({ days, profile, onDay, bottomSpace }: MonthViewProps) {
  // Newest first: the list is inverted. monthsSince returns a fresh array, so reversing it is safe.
  const months = useMemo(() => monthsSince(days).reverse(), [days]);
  const renderMonth = useCallback(
    ({ item }: { item: MonthItem }) => <Month year={item.year} month={item.month} days={days} onDay={onDay} />,
    [days, onDay]
  );
  const streak = useMemo(() => streakWeeks(profile.sessions), [profile]);
  const rest = useMemo(() => restDays(days), [days]);

  return (
    <>
      <View style={styles.summary}>
        <View style={styles.summaryHalf}>
          <Fire size={ICON_SIZES.lg} weight="fill" color={COLORS.streak} />
          <Text style={styles.summaryText}>{streak} week streak</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryHalf}>
          <Moon size={ICON_SIZES.lg} weight="fill" color={COLORS.primary} />
          <Text style={styles.summaryText}>{rest} rest days</Text>
        </View>
      </View>
      <View style={styles.weekdays}>
        {WEEKDAY_NAMES.map((d) => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>
      {/* Inverted: the current month sits at the bottom and older ones scroll in from above. */}
      <FlatList
        inverted
        data={months}
        keyExtractor={monthKey}
        renderItem={renderMonth}
        ListHeaderComponent={bottomSpace}
        {...LIST_RENDERING.calendarMonths}
      />
    </>
  );
}

const styles = StyleSheet.create({
  summary: {
    height: CALENDAR_SIZES.summaryHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  summaryHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: COLORS.separator,
  },
  summaryText: {
    marginLeft: SPACE.sm,
    ...TYPE.row,
  },
  weekdays: {
    height: CALENDAR_SIZES.weekdaysHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  month: {
    paddingTop: SPACE.md,
    paddingHorizontal: SPACE.xs,
  },
  monthTitle: {
    marginLeft: SPACE.md,
    marginBottom: SPACE.md,
    ...TYPE.headlineSemibold,
  },
  week: {
    height: CALENDAR_SIZES.weekHeight,
    flexDirection: 'row',
  },
  weekLine: {
    position: 'absolute',
    top: 0,
    height: CALENDAR_SIZES.weekLineHeight,
    backgroundColor: COLORS.separator,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACE.xs,
  },
  dayCircle: {
    width: SIZES.dayCircle,
    height: SIZES.dayCircle,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleOn: {
    backgroundColor: COLORS.primary,
  },
  // Today: a blue ring, white on a workout day's blue circle.
  today: {
    borderWidth: BORDER_WIDTHS.thin,
    borderRadius: RADIUS.xxl,
    borderColor: COLORS.primary,
  },
  todayOn: {
    borderWidth: BORDER_WIDTHS.thin,
    borderRadius: RADIUS.xxl,
    borderColor: COLORS.text,
  },
  todayNumber: {
    color: COLORS.primary,
  },
  dayNumber: {
    ...TYPE.row,
  },
  dayLabel: {
    marginTop: SPACE.xxs,
    maxWidth: CALENDAR_SIZES.dayLabelMaxWidth,
    ...TYPE.micro,
    color: COLORS.textSecondary,
  },
});
