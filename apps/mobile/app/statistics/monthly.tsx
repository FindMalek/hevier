import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';

import { ExerciseThumb } from '@/components/exercises/ExerciseThumb';
import { InnerHeader } from '@/components/ui/InnerHeader';
import { MuscleBars } from '@/components/charts/MuscleBars';
import { PeriodNav } from '@/components/charts/PeriodNav';
import { COLORS, TYPE } from '@/constants/theme';
import { MONTHLY_REPORT_LIMITS } from '@/constants/limits';
import { monthWeeks } from '@/lib/calendar';
import { durationLabel } from '@/lib/format/feed';
import { getStatSets } from '@/db/stats/statSets';
import { change, monthReport } from '@/lib/stats/stats';
import { volumeLabel } from '@/lib/format/weight';
import { RADIUS, SPACE } from '@/constants/layout';
import { STATISTICS_MONTHLY_SIZES } from '@/constants/sizes';
import { monthYear } from '@/lib/format/date';
import type { StatSet } from '@/types/stats';
import { Screen } from '@/components/ui/Screen';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import { EmptyState } from '@/components/ui/EmptyState';

// Statistics → Monthly Report: a month at a
// time; its numbers against the month before, the days trained, the top
// exercises and the sets per muscle.
export default function MonthlyReportScreen() {
  const router = useRouter();
  const [sets, setSets] = useState<StatSet[] | null>(null);
  // Fixed while the screen is open, so the memoized reports below hold.
  const [now] = useState(() => new Date());
  const [month, setMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });

  useFocusEffect(
    useCallback(() => {
      getStatSets().then(setSets);
    }, [])
  );

  const atNow = month.year === now.getFullYear() && month.month === now.getMonth();
  const today = now.getDate();
  // Memoized on the month: both reports go over every set.
  const reports = useMemo(() => {
    if (!sets) return null;
    return {
      report: monthReport(sets, month.year, month.month),
      // This month so far is compared with the same days of last month.
      before: monthReport(
        sets,
        month.month === 0 ? month.year - 1 : month.year,
        (month.month + 11) % 12,
        atNow ? today : undefined
      ),
    };
  }, [sets, month, atNow, today]);

  if (!sets || !reports) return <Screen />;
  const { report, before } = reports;
  const first = sets.length ? new Date(sets[0].startTime) : now;
  const atFirst = month.year === first.getFullYear() && month.month === first.getMonth();
  const step = (n: number) => {
    const d = new Date(month.year, month.month + n, 1);
    setMonth({ year: d.getFullYear(), month: d.getMonth() });
  };

  const tiles = [
    { label: 'Workouts', value: String(report.workouts), delta: change(report.workouts, before.workouts) },
    { label: 'Duration', value: durationLabel(report.durationSeconds), delta: change(report.durationSeconds, before.durationSeconds) },
    { label: 'Volume', value: volumeLabel(report.volumeKg), delta: change(report.volumeKg, before.volumeKg) },
    { label: 'Sets', value: String(report.sets), delta: change(report.sets, before.sets) },
  ];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Monthly Report" />
      <ScrollView contentContainerStyle={SCREEN_STYLES.content}>
        <PeriodNav
          label={monthYear(new Date(month.year, month.month, 1))}
          onPrevious={atFirst ? undefined : () => step(-1)}
          onNext={atNow ? undefined : () => step(1)}
        />

        <View style={styles.tiles}>
          {tiles.map((t) => (
            <View key={t.label} style={styles.tile}>
              <Text style={styles.tileLabel}>{t.label}</Text>
              <Text style={styles.tileValue}>{t.value}</Text>
              {t.delta ? (
                <Text style={[styles.delta, t.delta.startsWith('-') ? styles.down : styles.up]}>
                  {t.delta} vs {atNow ? `last month's first ${now.getDate()} days` : 'last month'}
                </Text>
              ) : null}
            </View>
          ))}
        </View>

        <Text style={styles.section}>Days trained · {report.days.size}</Text>
        <View style={styles.weekdays}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>
        {monthWeeks(month.year, month.month).map((week, w) => (
          <View key={w} style={styles.week}>
            {week.map((date, i) => (
              <View key={i} style={styles.dayCell}>
                {date && (
                  <View style={[styles.day, report.days.has(date.getDate()) && styles.dayOn]}>
                    <Text style={styles.dayNumber}>{date.getDate()}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.section}>Top exercises</Text>
        {report.topExercises.length === 0 && <EmptyState message="No workouts this month" note />}
        {report.topExercises.map((e) => (
          <Pressable key={e.exerciseId} style={styles.exercise} onPress={() => router.push(`/exercises/${e.exerciseId}`)}>
            <ExerciseThumb catalogueId={e.catalogueId} />
            <Text style={styles.exerciseName} numberOfLines={1}>
              {e.name}
            </Text>
            <Text style={styles.exerciseSets}>{e.sets} sets</Text>
          </Pressable>
        ))}

        <Text style={styles.section}>Sets per muscle</Text>
        <MuscleBars counts={report.muscles} limit={MONTHLY_REPORT_LIMITS.shownMuscles} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: SPACE.md,
  },
  tile: {
    width: '48%',
    padding: SPACE.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  tileLabel: {
    ...TYPE.small,
    color: COLORS.textSecondary,
  },
  tileValue: {
    marginTop: SPACE.xs,
    ...TYPE.headingSemibold,
  },
  delta: {
    marginTop: SPACE.xs,
    ...TYPE.xs,
  },
  up: {
    color: COLORS.success,
  },
  down: {
    color: COLORS.danger,
  },
  section: {
    marginTop: SPACE.xl,
    marginBottom: SPACE.xs,
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  weekdays: {
    marginTop: SPACE.sm,
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  week: {
    flexDirection: 'row',
    marginTop: SPACE.xs,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  day: {
    width: STATISTICS_MONTHLY_SIZES.dayWidth,
    height: STATISTICS_MONTHLY_SIZES.dayHeight,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayOn: {
    backgroundColor: COLORS.primary,
  },
  dayNumber: {
    ...TYPE.callout,
  },
  exercise: {
    height: STATISTICS_MONTHLY_SIZES.exerciseHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseName: {
    flex: 1,
    marginLeft: SPACE.lg,
    ...TYPE.bodyMedium,
  },
  exerciseSets: {
    ...TYPE.callout,
    color: COLORS.textSecondary,
  },
});
