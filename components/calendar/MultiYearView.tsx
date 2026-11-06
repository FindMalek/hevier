import { memo, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg from 'react-native-svg';

import { TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { CALENDAR_SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import { MONTH_NAMES } from '@/constants/time';
import { todayKey, trainedKeys, yearGrid, yearsSince } from './grid';
import { gridCell } from './gridCell';
import { shared } from './styles';
import type { MultiYearBlockProps, MultiYearViewProps } from './types';

// A year's week columns as one Svg instead of 53 × 7 Views.
const MultiYearBlock = memo(function MultiYearBlock({ year, width, trained, today }: MultiYearBlockProps) {
  // 53 week columns across the width; cells 6.1 of a 7.24 pitch.
  const pitch = (width - 32) / 53;
  const size = pitch * 0.84;
  const { cells, cols, rows } = yearGrid(year);
  return (
    <View style={styles.multiYearBlock}>
      <Text style={shared.yearTitle}>{year}</Text>
      <View style={styles.multiYearMonths}>
        {/* Evenly spaced, not on each month's first week. */}
        {MONTH_NAMES.map((name, month) => (
          <Text key={name} style={[styles.multiYearMonth, { left: (month * (width - 32)) / 12 }]}>
            {name}
          </Text>
        ))}
      </View>
      <Svg width={cols * pitch} height={rows * pitch} style={styles.multiYearGrid}>
        {cells.map((c) => gridCell(c.key, c.col * pitch, c.row * pitch, size, 1, trained, today))}
      </Svg>
    </View>
  );
});

// Every year since the first workout as a GitHub-style week-column grid, oldest first.
export function MultiYearView({ days }: MultiYearViewProps) {
  const { width } = useWindowDimensions();
  const trained = useMemo(() => trainedKeys(days), [days]);
  const years = useMemo(() => yearsSince(days), [days]);
  const today = todayKey();
  const renderItem = useCallback(
    ({ item: year }: { item: number }) => <MultiYearBlock year={year} width={width} trained={trained} today={today} />,
    [width, trained, today]
  );
  return (
    <FlatList
      data={years}
      keyExtractor={String}
      renderItem={renderItem}
      contentContainerStyle={styles.multiYear}
      {...LIST_RENDERING.calendarMultiYear}
    />
  );
}

const styles = StyleSheet.create({
  multiYear: {
    paddingHorizontal: LAYOUT.screenMargin,
    paddingBottom: SPACE.xxl,
  },
  multiYearBlock: {
    marginTop: SPACE.xxl,
  },
  multiYearMonths: {
    height: CALENDAR_SIZES.multiYearMonthsHeight,
    marginTop: SPACE.sm,
  },
  multiYearMonth: {
    position: 'absolute',
    ...TYPE.caption,
  },
  multiYearGrid: {
    marginTop: SPACE.xs,
    flexDirection: 'row',
  },
});
