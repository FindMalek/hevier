import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Stat } from '@/components/ui/Stat';
import { COLORS, LINE_HEIGHTS, TYPE } from '@/constants/theme';
import { HIT_SLOPS, LAYOUT, SPACE } from '@/constants/layout';
import { PROFILE_TAB_SIZES, SIZES } from '@/constants/sizes';
import { streakWeeks, totalHours } from '@/lib/stats/profileCharts';
import { DashboardTiles } from './DashboardTiles';
import { ProfileChart } from './ProfileChart';
import type { ProfileHeaderProps } from './types';

// Everything above the workout list: avatar, name, Workouts / Streak / Hours,
// the chart, the
// Dashboard tiles and the "Workouts" title.
// Memoized with stable props: the list doesn't redraw it on a scroll, and a
// bar tap redraws only this header.
export const ProfileHeader = memo(function ProfileHeader({ profile, now, onAvatar }: ProfileHeaderProps) {
  const sessions = profile.sessions;
  const streak = useMemo(() => streakWeeks(sessions, new Date(now)), [sessions, now]);
  const hours = useMemo(() => totalHours(sessions), [sessions]);
  return (
    <View style={styles.content}>
      <View style={styles.identity}>
        <Pressable onPress={onAvatar} hitSlop={HIT_SLOPS.sm} style={({ pressed }) => pressed && styles.avatarPressed}>
          <Avatar name={profile.name} size={SIZES.avatarLarge} />
        </Pressable>
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          <View style={styles.stats}>
            <Stat label="Workouts" value={String(sessions.length)} size="medium" style={styles.stat} />
            <Stat label="Streak" value={`${streak} wks`} size="medium" style={styles.stat} />
            <Stat label="Hours" value={String(hours)} size="medium" style={styles.stat} />
          </View>
        </View>
      </View>

      <ProfileChart sessions={sessions} now={now} />

      <Text style={styles.section}>Dashboard</Text>
      <DashboardTiles />

      <Text style={[styles.section, styles.workoutsLabel]}>Workouts</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: LAYOUT.screenMargin,
  },
  avatarPressed: {
    opacity: 0.7,
  },
  identity: {
    marginTop: SPACE.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityText: {
    flex: 1,
    marginLeft: SPACE.lg,
  },
  name: {
    ...TYPE.titleSemibold,
    lineHeight: LINE_HEIGHTS.relaxed,
  },
  stats: {
    marginTop: SPACE.xs,
    flexDirection: 'row',
  },
  // Columns start 107 apart.
  stat: {
    width: PROFILE_TAB_SIZES.statWidth,
  },
  // "Dashboard" / "Workouts": 16 grey, like "Exercises" on the routine page.
  section: {
    marginTop: SPACE.lg,
    ...TYPE.body,
    lineHeight: LINE_HEIGHTS.normal,
    color: COLORS.textSecondary,
  },
  workoutsLabel: {
    marginTop: SPACE.lg,
  },
});
