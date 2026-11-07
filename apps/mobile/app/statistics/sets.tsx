import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';

import { InnerHeader } from '@/components/ui/InnerHeader';
import { MuscleBars } from '@/components/charts/MuscleBars';
import { COLORS, TYPE } from '@/constants/theme';
import { periodIndex } from '@/lib/training/periods';
import { getStatSets } from '@/db/stats/statSets';
import { between, daysLogged, periods, setsPerMuscle } from '@/lib/stats/stats';
import { CHART_DEFAULTS } from '@/constants/defaults';

import { PERIODS } from '@/constants/periods';
import type { StatSet } from '@/types/stats';
import { Screen } from '@/components/ui/Screen';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import { ChartHeader } from '@/components/charts/ChartHeader';

// Statistics → Set count per muscle group: total sets and a weekly average for the range, then
// each muscle group's sets as a bar.

export default function SetCountScreen() {
  const [sets, setSets] = useState<StatSet[] | null>(null);
  const [range, setRange] = useState(() => periodIndex(CHART_DEFAULTS.setCountPeriod));

  useFocusEffect(
    useCallback(() => {
      getStatSets().then(setSets);
    }, [])
  );

  const r = PERIODS[range];
  const counts = useMemo(() => {
    const inRange = !sets ? [] : r.days === null ? sets : between(sets, ...periods(r.days).current);
    return setsPerMuscle(inRange);
  }, [sets, r.days]);
  const total = counts.reduce((a, c) => a + c.sets, 0);
  const logged = useMemo(() => daysLogged(sets ?? []), [sets]);
  const days = r.days ?? logged;
  const perWeek = Math.round(total / (days / 7));

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Set Count" />
      <ScrollView contentContainerStyle={SCREEN_STYLES.content}>
        <ChartHeader ranges={PERIODS} range={range} onRange={setRange}>
          <Text style={styles.summaryValue}>{total} sets</Text>
          <Text style={styles.summaryNote}> · {perWeek} a week</Text>
        </ChartHeader>
        {sets && <MuscleBars counts={counts} />}
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  summaryValue: {
    ...TYPE.titleSemibold,
  },
  summaryNote: {
    ...TYPE.title,
    color: COLORS.textSecondary,
  },
});
