import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';

import { HeaderPillButton, InnerHeader } from '@/components/ui/InnerHeader';
import { Screen } from '@/components/ui/Screen';
import { Divider } from '@/components/ui/Divider';
import { SwipeToDelete } from '@/components/ui/SwipeToDelete';
import { SCREEN_STYLES } from '@/components/ui/screenStyles';
import { ChartHeader, SESSION_SUMMARY_STYLES } from '@/components/charts/ChartHeader';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { addBodyWeight, deleteBodyWeight, getBodyWeights } from '@/db/bodyWeight/bodyWeight';
import { bodyWeightChange, changeLabel, parseBodyWeight } from '@/lib/domain/bodyWeight';
import { fullDate, monthDay, shortDate } from '@/lib/format/date';
import { inPeriod, periodIndex } from '@/lib/training/periods';
import { round2 } from '@/lib/format/weight';
import { COLORS, TYPE } from '@/constants/theme';
import { LAYOUT, SPACE } from '@/constants/layout';
import { CHART_DEFAULTS } from '@/constants/defaults';
import { PERIODS } from '@/constants/periods';
import { EDIT_PROFILE_SIZES, EXERCISE_PAGE_SIZES, SIZES } from '@/constants/sizes';
import type { BodyWeightEntry } from '@/types/bodyWeight';

// Profile → Body weight: the exercise page's chart (weight over the chosen
// period, tap a dot to see it) with how much was gained or lost, then the field
// to log today's weight (Save) and the weights logged so far (newest first,
// swipe left to delete). Pull-ups, dips and the other body weight exercises
// count the weight logged at the time of the workout.
export default function BodyWeight() {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [text, setText] = useState('');
  const kg = parseBodyWeight(text);
  const [range, setRange] = useState(() => periodIndex(CHART_DEFAULTS.bodyWeightPeriod));
  const [selected, setSelected] = useState<number | null>(null);
  const pickRange = useCallback((i: number) => {
    setRange(i);
    setSelected(null);
  }, []);

  // Oldest first, in the chosen period.
  const shownEntries = useMemo(
    () => inPeriod(entries.map((e) => ({ ...e, startTime: e.loggedAt })), PERIODS[range].days).reverse(),
    [entries, range]
  );
  const chart = useMemo(() => shownEntries.map((e) => ({ label: monthDay(new Date(e.loggedAt)), value: e.weightKg })), [shownEntries]);
  const tick = useCallback((v: number) => `${round2(v)} kg`, []);
  const shown = selected !== null && selected < shownEntries.length ? selected : shownEntries.length - 1;
  const change = bodyWeightChange(shownEntries);

  const reload = useCallback(() => {
    getBodyWeights().then(setEntries);
  }, []);
  useFocusEffect(reload);

  async function save() {
    if (kg === null) return;
    await addBodyWeight(kg);
    setText('');
    reload();
  }

  async function remove(id: string) {
    await deleteBodyWeight(id);
    reload();
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <InnerHeader title="Body weight" right={<HeaderPillButton label="Save" disabled={kg === null} onPress={save} />} />
      <ScrollView contentContainerStyle={SCREEN_STYLES.content} keyboardShouldPersistTaps="handled">
        <ChartHeader ranges={PERIODS} range={range} onRange={pickRange}>
          {shown >= 0 ? (
            <>
              <Text style={SESSION_SUMMARY_STYLES.value}>{round2(shownEntries[shown].weightKg)} kg </Text>
              <Text style={SESSION_SUMMARY_STYLES.date}>{shortDate(new Date(shownEntries[shown].loggedAt))}</Text>
            </>
          ) : (
            <Text style={SESSION_SUMMARY_STYLES.empty}>No data yet</Text>
          )}
        </ChartHeader>
        <View style={styles.chart}>
          {chart.length > 0 && <ProgressChart points={chart} formatTick={tick} selected={shown} onSelect={setSelected} />}
        </View>
        {change && (
          <Text style={styles.change}>
            {changeLabel(change.deltaKg)} since {fullDate(new Date(change.since))}
          </Text>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Weight</Text>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={entries[0] ? round2(entries[0].weightKg) : '80'}
            placeholderTextColor={COLORS.textSecondary}
            selectionColor={COLORS.primary}
            cursorColor={COLORS.primary}
            keyboardType="decimal-pad"
            returnKeyType="done"
            onSubmitEditing={save}
          />
          <Text style={styles.unit}>kg</Text>
        </View>
        <Divider />
        <Text style={styles.help}>Pull-ups, dips and other body weight exercises count your body weight as weight lifted.</Text>

        <Text style={styles.section}>History</Text>
        {entries.length === 0 && <Text style={styles.help}>No body weight logged yet.</Text>}
        {entries.map((e) => (
          <View key={e.id}>
            <SwipeToDelete rowStyle={styles.row} onDelete={() => remove(e.id)}>
              <Text style={styles.date}>{fullDate(new Date(e.loggedAt))}</Text>
              <Text style={styles.value}>{round2(e.weightKg)} kg</Text>
            </SwipeToDelete>
            <Divider />
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // As the exercise page's chart.
  chart: {
    marginTop: SPACE.xl,
    marginHorizontal: -LAYOUT.screenMargin,
    minHeight: EXERCISE_PAGE_SIZES.chartMinHeight,
  },
  change: {
    marginTop: SPACE.sm,
    ...TYPE.bodySemibold,
  },
  field: {
    height: SIZES.formRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACE.lg,
  },
  label: {
    width: EDIT_PROFILE_SIZES.labelWidth,
    ...TYPE.body,
  },
  input: {
    flex: 1,
    ...TYPE.body,
    padding: 0,
  },
  unit: {
    ...TYPE.body,
    color: COLORS.textSecondary,
  },
  help: {
    marginTop: SPACE.md,
    ...TYPE.caption,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: SPACE.xxl,
    marginBottom: SPACE.sm,
    ...TYPE.bodySemibold,
    color: COLORS.textSecondary,
  },
  row: {
    height: SIZES.formRowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
  },
  date: {
    ...TYPE.body,
  },
  value: {
    ...TYPE.bodySemibold,
  },
});
