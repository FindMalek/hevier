import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Gear } from 'phosphor-react-native/src/icons/Gear';
import { PencilSimple } from 'phosphor-react-native/src/icons/PencilSimple';
import { UploadSimple } from 'phosphor-react-native/src/icons/UploadSimple';

import { HeaderIconButton, TabHeader } from '@/components/ui/TabHeader';
import { WorkoutCard } from '@/components/workout/WorkoutCard';
import { useWorkoutMenu } from '@/components/workout/WorkoutMenu';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { COLORS } from '@/constants/theme';
import { SPACE } from '@/constants/layout';
import { ICON_SIZES } from '@/constants/sizes';
import { LIST_RENDERING } from '@/constants/limits';
import { SCROLL_EVENTS } from '@/constants/motion';
import { getWorkoutCards } from '@/db/feed/cards';
import { getProfile } from '@/db/profile/profile';
import { dayLabel } from '@/lib/format/feed';
import { idKey } from '@/lib/misc';
import { useScrolledDivider } from '@/hooks/useScrolledDivider';
import { useProfilePhotoSheet } from '@/hooks/useProfilePhotoSheet';
import type { WorkoutCardData } from '@/types/feed';
import type { Profile } from '@/types/profile';

// The Profile tab: workouts, streak and hours, the chart, the dashboard, then
// the workouts list. Tap the avatar to choose a photo (else the name's initial).
// The header (identity, chart, dashboard) lives in components/profile/.

export default function ProfileTab() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<WorkoutCardData[]>([]);
  const { onAvatar, sheet: photoSheet } = useProfilePhotoSheet();
  const { scrolled, onScroll } = useScrolledDivider();

  // "Today" and the current week come from this, not from the (cached) data: refreshed on every visit.
  const [now, setNow] = useState(() => Date.now());
  const reload = useCallback(() => {
    setNow(Date.now());
    getProfile().then(setProfile);
    getWorkoutCards().then(setWorkouts);
  }, []);
  useFocusEffect(reload);
  const { openMenu, menu } = useWorkoutMenu(reload);
  const openWorkout = useCallback((id: string) => router.push(`/workout/${id}`), [router]);

  // Same element while nothing in it changes, so the FlatList doesn't redraw its header.
  const top = useMemo(
    () => profile && <ProfileHeader profile={profile} now={now} onAvatar={onAvatar} />,
    [profile, now, onAvatar]
  );

  const renderItem = useCallback(
    ({ item }: { item: WorkoutCardData }) => (
      <WorkoutCard
        workout={item}
        username={profile?.username ?? ''}
        name={profile?.name ?? ''}
        when={dayLabel(item.startTime, new Date(now))}
        onOpen={openWorkout}
        onMenu={openMenu}
      />
    ),
    [profile?.username, profile?.name, now, openWorkout, openMenu]
  );

  return (
    <Screen>
      <TabHeader
        title={profile?.username ?? ''}
        divider={scrolled}
        right={
          <>
            <HeaderIconButton onPress={() => router.push('/edit-profile')}>
              <PencilSimple size={ICON_SIZES.xl} color={COLORS.text} />
            </HeaderIconButton>
            <HeaderIconButton><UploadSimple size={ICON_SIZES.xxl} color={COLORS.text} /></HeaderIconButton>
            <HeaderIconButton onPress={() => router.push('/settings')}>
              <Gear size={ICON_SIZES.xxl} color={COLORS.text} />
            </HeaderIconButton>
          </>
        }
      />
      {profile && (
        <FlatList
          data={workouts}
          keyExtractor={idKey}
          ListHeaderComponent={top}
          contentContainerStyle={styles.list}
          onScroll={onScroll}
          scrollEventThrottle={SCROLL_EVENTS.throttleMs}
          renderItem={renderItem}
          ListEmptyComponent={empty}
          {...LIST_RENDERING.feed}
          removeClippedSubviews
        />
      )}

      {photoSheet}
      {menu}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: SPACE.xxl,
  },
});

// Built once: an inline element would be a new ListEmptyComponent on every render.
const empty = <EmptyState message="No workouts yet" />;
