import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Barbell } from 'phosphor-react-native/src/icons/Barbell';
import { CaretRight } from 'phosphor-react-native/src/icons/CaretRight';
import { ChartBar } from 'phosphor-react-native/src/icons/ChartBar';
import { FileText } from 'phosphor-react-native/src/icons/FileText';
import { Pentagon } from 'phosphor-react-native/src/icons/Pentagon';
import { PersonSimple } from 'phosphor-react-native/src/icons/PersonSimple';

import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { STATISTICS_ROW_LABELS } from '@/constants/labels';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES, STATISTICS_SIZES } from '@/constants/sizes';
import type { AdvancedStatsRow } from './types';

const ROWS: AdvancedStatsRow[] = [
  {
    icon: <ChartBar size={ICON_SIZES.huge} weight="light" color={COLORS.text} />,
    ...STATISTICS_ROW_LABELS.setCount,
    href: '/statistics/sets',
  },
  {
    icon: <Pentagon size={ICON_SIZES.huge} weight="light" color={COLORS.text} />,
    ...STATISTICS_ROW_LABELS.distributionChart,
    href: '/statistics/distribution',
  },
  {
    icon: <PersonSimple size={ICON_SIZES.huge} weight="light" color={COLORS.text} />,
    ...STATISTICS_ROW_LABELS.distributionBody,
    href: '/statistics/body',
  },
  {
    icon: <Barbell size={ICON_SIZES.huge} weight="light" color={COLORS.text} />,
    ...STATISTICS_ROW_LABELS.mainExercises,
    href: '/statistics/exercises',
  },
  {
    icon: <FileText size={ICON_SIZES.huge} weight="light" color={COLORS.text} />,
    ...STATISTICS_ROW_LABELS.monthlyReport,
    href: '/statistics/monthly',
  },
];

// "Advanced statistics": a grey section bar, then a row per statistics page.
// Left out: Leaderboard Exercises (social).
export function AdvancedStatsList() {
  const router = useRouter();
  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Advanced statistics</Text>
      </View>
      {ROWS.map((row, i) => (
        <Pressable
          key={row.title}
          style={({ pressed }) => [styles.row, i > 0 && styles.rowDivider, pressed && styles.pressed]}
          onPress={() => router.push(row.href)}>
          <View style={styles.rowIcon}>{row.icon}</View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>{row.title}</Text>
            <Text style={styles.rowSubtitle}>{row.subtitle}</Text>
          </View>
          <CaretRight size={ICON_SIZES.md} color={COLORS.textSecondary} />
        </Pressable>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    height: STATISTICS_SIZES.sectionHeight,
    justifyContent: 'center',
    paddingHorizontal: SPACE.xl,
    backgroundColor: COLORS.surface,
  },
  sectionLabel: {
    ...TYPE.row,
    color: COLORS.textSecondary,
  },
  row: {
    minHeight: STATISTICS_SIZES.rowMinHeight,
    paddingVertical: SPACE.md,
    paddingLeft: SPACE.md,
    paddingRight: SPACE.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.separator,
  },
  pressed: {
    opacity: 0.7,
  },
  rowIcon: {
    width: STATISTICS_SIZES.rowIconWidth,
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginLeft: SPACE.lg,
    marginRight: SPACE.md,
  },
  rowTitle: {
    ...TYPE.row,
    lineHeight: LINE_HEIGHTS.normal,
  },
  rowSubtitle: {
    marginTop: SPACE.xxs,
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
});
