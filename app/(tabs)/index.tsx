import { useCallback, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { CycleCard } from '@/components/routines/CycleCard';
import { TabHeader } from '@/components/ui/TabHeader';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { useWorkoutMenu } from '@/components/workout/WorkoutMenu';
import { getWorkoutCards } from '@/db/feed/cards';
import { timeAgo } from '@/lib/format/feed';
import { getProfileNames } from '@/db/profile/names';
import { getCycle, skipCycle } from '@/db/rotation/cycle';
import { SPACE } from '@/constants/layout';
import { LIST_RENDERING } from '@/constants/limits';
import { SCROLL_EVENTS } from '@/constants/motion';
import { idKey, noop } from '@/lib/misc';
import type { WorkoutCardData } from '@/types/feed';
import type { Cycle } from '@/types/routine';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { useScrolledDivider } from '@/hooks/useScrolledDivider';

// The Home feed: your own workouts as cards, newest first. No social
// features (search, notifications, likes, comments).
export default function HomeTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ name: string; username: string } | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutCardData[]>([]);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const { start, dialog: startDialog } = useStartWorkout();
  const { scrolled, onScroll } = useScrolledDivider();

  // "2h ago" is worked out from this, not from the (cached) cards: refreshed on every visit.
  const [now, setNow] = useState(() => Date.now());
  const reload = useCallback(() => {
    setNow(Date.now());
    // Only the names: no need to read the whole history for them.
    getProfileNames().then(setProfile);
    getWorkoutCards().then(setWorkouts);
    getCycle().then(setCycle);
  }, []);
  useFocusEffect(reload);
  const { openMenu, menu } = useWorkoutMenu(reload);
  const openWorkout = useCallback((id: string) => router.push(`/workout/${id}`), [router]);

  const openRoutine = useCallback((id: string) => router.push(`/workout/routine/${id}`), [router]);
  // A second tap before the first is saved would skip from the same routine twice.
  const skipping = useRef(false);
  const skip = useCallback(async () => {
    if (!cycle || skipping.current) return;
    skipping.current = true;
    try {
      await skipCycle(cycle);
      setCycle(await getCycle());
    } catch (e) {
      console.warn('Skip failed', e);
    } finally {
      skipping.current = false;
    }
  }, [cycle]);
  const header = useMemo(
    () => cycle && <CycleCard cycle={cycle} now={now} onOpen={openRoutine} onStart={start} onSkip={skip} />,
    [cycle, now, openRoutine, start, skip]
  );

  const username = profile?.username ?? '';
  const name = profile?.name ?? '';
  const renderItem = useCallback(
    ({ item }: { item: WorkoutCardData }) => (
      <WorkoutCard
        workout={item}
        username={username}
        name={name}
        when={timeAgo(item.startTime, new Date(now))}
        onOpen={openWorkout}
        onMenu={openMenu}
        band
      />
    ),
    [username, name, now, openWorkout, openMenu]
  );

  return (
    <Screen>
      <TabHeader title="Home" onTitlePress={noop} divider={scrolled} />
      {profile && (
        <FlatList
          data={workouts}
          keyExtractor={idKey}
          onScroll={onScroll}
          scrollEventThrottle={SCROLL_EVENTS.throttleMs}
          renderItem={renderItem}
          ListHeaderComponent={header}
          ListEmptyComponent={empty}
          {...LIST_RENDERING.feed}
          removeClippedSubviews
        />
      )}
      {menu}
      {startDialog}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    marginTop: SPACE.xxxl,
  },
});

// Built once: an inline element would be a new ListEmptyComponent on every render.
const empty = <EmptyState message="No workouts yet" style={styles.empty} />;
