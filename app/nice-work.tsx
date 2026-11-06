import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { FlatList, Pressable, StyleSheet, Text, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Confetti } from '@/components/ui/Confetti';
import { groupColors } from '@/components/body/BodyFigure';
import { BodyCard, ExercisesCard, MinimalCard, RadarCard, WeightCard, PrCard, StatsCard, StreakCard, SummaryCard } from '@/components/share-cards';
import { BODY_MAP_COLORS, COLORS, FONT_SIZES, TYPE } from '@/constants/theme';
import { getWorkoutCards } from '@/db/feed/cards';
import type { MuscleGroup } from '@/types/muscles';
import { getProfile } from '@/db/profile/profile';
import { streakWeeks } from '@/lib/stats/profileCharts';
import { weightComparison } from '@/lib/training/weightComparison';
import { getStatSets } from '@/db/stats/statSets';
import { lastSevenDays, setsPerBodyPart } from '@/lib/stats/stats';
import { BORDER_WIDTHS, HIT_SLOPS, LAYOUT, RADIUS, SPACE } from '@/constants/layout';
import { NICE_WORK_SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import type { StatSet } from '@/types/stats';
import { Screen } from '@/components/ui/Screen';
import type { NiceWorkData } from '@/types/feed';

// "Nice work!" after Save: which workout this is, then cards to swipe
// through (streak, each PR, summary, stats, minimal) and Done.

// "1st", "2nd", "3rd", "11th", "172nd"
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
}


const PRIMARY = BODY_MAP_COLORS.primaryMuscle;
const SECONDARY = BODY_MAP_COLORS.secondaryMuscle;

// This workout's muscles: primary blue, secondary light blue.
function workoutMuscles(sets: StatSet[]): Map<string, string> {
  const shades = new Map<MuscleGroup, string>();
  for (const s of sets) for (const m of s.secondary) shades.set(m, SECONDARY);
  for (const s of sets) shades.set(s.primary, PRIMARY);
  return groupColors(shades);
}

export default function NiceWork() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [data, setData] = useState<NiceWorkData | null>(null);
  const [page, setPage] = useState(0);
  const [burst, setBurst] = useState(0); // 🎉 plays the confetti again
  const size = width - 32;

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [cards, profile, sets] = await Promise.all([getWorkoutCards(), getProfile(), getStatSets()]);
      // Newest first: the how-many-th is counted from the oldest.
      const index = cards.findIndex((w) => w.id === id);
      if (index < 0) return;
      const workout = cards[index];
      const end = new Date(workout.startTime);
      const days = lastSevenDays(sets, end);
      const from = days[0].date.getTime();
      // The day after the last one by the calendar: + 24 h is off by an hour across a DST change.
      const last = days[6].date;
      const to = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1).getTime();
      const recent = sets.filter((s) => {
        const t = new Date(s.startTime).getTime();
        return t >= from && t < to;
      });
      setData({
        workout,
        muscles: workoutMuscles(sets.filter((s) => s.workoutId === id)),
        parts: setsPerBodyPart(sets.filter((s) => s.workoutId === id)),
        days,
        times: new Set(recent.map((s) => s.workoutId)).size,
        number: cards.length - index,
        streak: streakWeeks(profile.sessions),
        username: profile.username,
      });
    })();
  }, [id]);

  // Built once per data / size: a swipe (setPage) no longer rebuilds every card.
  const pages = useMemo(() => {
    if (!data) return [];
    const comparison = weightComparison(data.workout.volumeKg);
    return [
      ...(data.streak > 0 ? [{ key: 'streak', card: <StreakCard size={size} username={data.username} weeks={data.streak} /> }] : []),
      ...(data.workout.prs ?? []).map((r, i) => ({
        key: `pr${i}`,
        card: <PrCard size={size} username={data.username} record={r} />,
      })),
      {
        key: 'body',
        card: <BodyCard size={size} username={data.username} muscles={data.muscles} days={data.days} times={data.times} />,
      },
      { key: 'summary', card: <SummaryCard size={size} username={data.username} workout={data.workout} /> },
      {
        key: 'exercises',
        card: <ExercisesCard size={size} username={data.username} workout={data.workout} muscles={data.muscles} />,
      },
      {
        key: 'radar',
        card: <RadarCard size={size} username={data.username} workout={data.workout} parts={data.parts} />,
      },
      { key: 'stats', card: <StatsCard size={size} username={data.username} workout={data.workout} /> },
      { key: 'minimal', card: <MinimalCard size={size} username={data.username} workout={data.workout} /> },
      ...(comparison
        ? [{ key: 'weight', card: <WeightCard size={size} username={data.username} workout={data.workout} comparison={comparison} /> }]
        : []),
    ];
  }, [data, size]);
  const renderPage = useCallback(
    ({ item }: { item: { key: string; card: ReactElement } }) => <View style={[styles.page, { width }]}>{item.card}</View>,
    [width]
  );
  const pageLayout = useCallback((_: unknown, index: number) => ({ length: width, offset: width * index, index }), [width]);
  const onSwipe = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width)),
    [width]
  );
  // Done once: a double tap went back twice.
  const leaving = useRef(false);
  const done = () => {
    if (leaving.current) return;
    leaving.current = true;
    router.back();
  };

  return (
    <Screen style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <Text style={styles.title}>Nice work!</Text>
      <Pressable
        style={({ pressed }) => [styles.party, { top: insets.top + 6 }, pressed && styles.pressed]}
        onPress={() => setBurst((b) => b + 1)}
        hitSlop={HIT_SLOPS.md}>
        <Text style={styles.partyIcon}>🎉</Text>
      </Pressable>
      <Text style={styles.subtitle}>{data ? `This is your ${ordinal(data.number)} workout` : ' '}</Text>

      <View style={[styles.cards, { height: size }]}>
        <FlatList
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={pageKey}
          renderItem={renderPage}
          getItemLayout={pageLayout}
          {...LIST_RENDERING.shareCards}
          onMomentumScrollEnd={onSwipe}
        />
      </View>
      <View style={styles.dots}>
        {pages.map((p, i) => (
          <View key={p.key} style={[styles.dot, i === page && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.spacer} />

      <Pressable style={({ pressed }) => [styles.done, pressed && styles.pressed]} onPress={done}>
        <Text style={TYPE.bodyMedium}>Done</Text>
      </Pressable>
      {data && <Confetti key={burst} />}
    </Screen>
  );
}

function pageKey(p: { key: string }) {
  return p.key;
}

// Measured on nice-work-streak.jpg (2.625 px/dp; the phone's status bar is 41.5 dp).
const styles = StyleSheet.create({
  party: {
    position: 'absolute',
    right: NICE_WORK_SIZES.partyRight,
    width: NICE_WORK_SIZES.partyWidth,
    height: NICE_WORK_SIZES.partyHeight,
    borderRadius: RADIUS.round,
    borderWidth: BORDER_WIDTHS.hairline,
    borderColor: COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyIcon: {
    fontSize: FONT_SIZES.headline,
  },
  title: {
    marginTop: SPACE.sm,
    textAlign: 'center',
    ...TYPE.largeTitleBold,
  },
  subtitle: {
    marginTop: SPACE.sm,
    textAlign: 'center',
    ...TYPE.row,
  },
  cards: {
    marginTop: SPACE.xl,
  },
  spacer: {
    flex: 1,
  },
  page: {
    alignItems: 'center',
  },
  dots: {
    marginTop: SPACE.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACE.sm,
  },
  dot: {
    width: NICE_WORK_SIZES.dotWidth,
    height: NICE_WORK_SIZES.dotHeight,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.textSecondary,
  },
  dotOn: {
    backgroundColor: COLORS.primary,
  },
  done: {
    height: NICE_WORK_SIZES.doneHeight,
    marginHorizontal: LAYOUT.screenMargin,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
