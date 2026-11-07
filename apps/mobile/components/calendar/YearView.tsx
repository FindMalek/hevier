import { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Svg from 'react-native-svg';

import { TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { CALENDAR_SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import { MONTH_NAMES } from '@/constants/time';
import { miniMonthGrid, todayKey, trainedKeys, yearsSince } from './grid';
import { gridCell } from './gridCell';
import { shared } from './styles';
import type { MiniMonthProps, YearBlockProps, YearViewProps } from './types';

// A month's mini grid as one Svg instead of ~40 Views (the Year view drew ~3,000 Views).
function MiniMonth({ year, month, trained, today }: MiniMonthProps) {
  const { cells, cols, rows } = miniMonthGrid(year, month);
  const pitch = CALENDAR_SIZES.miniPitch;
  return (
    <Svg width={cols * pitch} height={rows * pitch}>
      {cells.map((c) => gridCell(c.key, c.col * pitch, c.row * pitch, CALENDAR_SIZES.mini, 2.5, trained, today))}
    </Svg>
  );
}

const YearBlock = memo(function YearBlock({ year, trained, today }: YearBlockProps) {
  return (
    <View style={styles.year}>
      <Text style={shared.yearTitle}>{year}</Text>
      <View style={styles.yearMonths}>
        {MONTH_NAMES.map((name, month) => (
          <View key={name} style={styles.yearMonth}>
            <Text style={styles.yearMonthName}>{name}</Text>
            <MiniMonth year={year} month={month} trained={trained} today={today} />
          </View>
        ))}
      </View>
    </View>
  );
});

// Every year since the first workout, a small grid per month, newest at the bottom.
export function YearView({ days, bottomSpace }: YearViewProps) {
  const trained = useMemo(() => trainedKeys(days), [days]);
  // Newest first: the list is inverted.
  const years = useMemo(() => yearsSince(days).reverse(), [days]);
  const today = todayKey();
  const renderItem = useCallback(
    ({ item: year }: { item: number }) => <YearBlock year={year} trained={trained} today={today} />,
    [trained, today]
  );
  return (
    <FlatList
      inverted
      data={years}
      keyExtractor={String}
      ListHeaderComponent={bottomSpace}
      renderItem={renderItem}
      {...LIST_RENDERING.calendarYears}
    />
  );
}

const styles = StyleSheet.create({
  year: {
    paddingHorizontal: LAYOUT.screenMargin,
    paddingTop: SPACE.lg,
  },
  yearMonths: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  yearMonth: {
    width: CALENDAR_SIZES.yearMonthWidth,
    marginTop: SPACE.md,
  },
  yearMonthName: {
    marginBottom: SPACE.sm,
    ...TYPE.body,
  },
});
