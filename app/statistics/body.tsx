import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';

import { BodyFigure, volumeView, zoneColor } from '@/components/body/BodyFigure';
import { InnerHeader } from '@/components/ui/InnerHeader';
import { MuscleBars } from '@/components/charts/MuscleBars';
import { PeriodNav } from '@/components/charts/PeriodNav';
import { effortWeights, hardSets } from '@/lib/training/effort';
import type { MuscleGroup } from '@/types/muscles';
import { periodLabel } from '@/lib/stats/profileCharts';
import { getStatSets } from '@/db/stats/statSets';
import { SPACE } from '@/constants/layout';
import { startOfWeek } from '@/lib/date';
import type { StatSet } from '@/types/stats';
import { Screen } from '@/components/ui/Screen';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';

// Statistics → Muscle distribution (Body): one
// week at a time, the body figure shaded by that week's hard sets against the
// target zones, and the hard sets per muscle (lib/training/effort.ts).
export default function BodyHeatMapScreen() {
  const [sets, setSets] = useState<StatSet[] | null>(null);
  const [start, setStart] = useState(() => startOfWeek(new Date()));

  useFocusEffect(
    useCallback(() => {
      getStatSets().then(setSets);
    }, [])
  );

  const weights = useMemo(() => (sets ? effortWeights(sets) : []), [sets]);
  // Memoized on the week: re-renders don't redo the pass over every set.
  const { view, bars } = useMemo(() => {
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    const hard: Map<MuscleGroup, number> = sets ? hardSets(sets, weights, start, end) : new Map();
    return {
      view: volumeView(hard),
      bars: [...hard]
        .filter(([m]) => m !== 'Cardio' && m !== 'Full Body' && m !== 'Other')
        .map(([muscle, n]) => ({ muscle, sets: n }))
        .sort((a, b) => b.sets - a.sets),
    };
  }, [sets, weights, start]);
  const thisWeek = startOfWeek(new Date()).getTime();
  const firstWeek = sets?.length ? startOfWeek(new Date(sets[0].startTime)).getTime() : thisWeek;
  const step = (weeks: number) => setStart(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7 * weeks));

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Muscle Heat Map" />
      <ScrollView contentContainerStyle={SCREEN_STYLES.content}>
        <PeriodNav
          label={start.getTime() === thisWeek ? 'This week' : periodLabel(start, 'week')}
          onPrevious={start.getTime() > firstWeek ? () => step(-1) : undefined}
          onNext={start.getTime() < thisWeek ? () => step(1) : undefined}
        />
        <View style={styles.figure}>
          <BodyFigure shades={view.shades} legend={view.legend} height={320} />
        </View>
        {sets && <MuscleBars counts={bars} colorOf={zoneColor} />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  figure: {
    marginTop: SPACE.md,
    marginBottom: SPACE.xl,
    alignItems: 'center',
  },
});
