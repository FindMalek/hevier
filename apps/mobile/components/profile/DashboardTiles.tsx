import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarDots } from 'phosphor-react-native/src/icons/CalendarDots';
import { ChartLineUp } from 'phosphor-react-native/src/icons/ChartLineUp';
import { PersonSimple } from 'phosphor-react-native/src/icons/PersonSimple';

import { WorkoutIcon } from '@/components/ui/WorkoutIcon';
import { COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, PROFILE_TAB_SIZES } from '@/constants/sizes';
import type { TileProps } from './types';

function Tile({ icon, label, onPress }: TileProps) {
  return (
    <Pressable style={({ pressed }) => [styles.tile, pressed && onPress && styles.pressed]} onPress={onPress}>
      <View style={styles.tileIcon}>{icon}</View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

// The Dashboard: Statistics, Exercises, Body weight and Calendar.
export function DashboardTiles() {
  const router = useRouter();
  return (
    <>
      <View style={styles.tiles}>
        <Tile
          icon={<ChartLineUp size={ICON_SIZES.xl} weight="light" color={COLORS.text} />}
          label="Statistics"
          onPress={() => router.push('/statistics')}
        />
        <Tile icon={<WorkoutIcon color={COLORS.text} />} label="Exercises" onPress={() => router.push('/exercises')} />
      </View>
      <View style={[styles.tiles, styles.tilesBelow]}>
        <Tile icon={<PersonSimple size={ICON_SIZES.xxl} weight="light" color={COLORS.text} />} label="Body weight" onPress={() => router.push('/body-weight')} />
        <Tile
          icon={<CalendarDots size={ICON_SIZES.xxl} weight="light" color={COLORS.text} />}
          label="Calendar"
          onPress={() => router.push('/calendar')}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Two columns 16 apart; tiles 46.9 tall, 17 apart.
  tiles: {
    marginTop: SPACE.lg,
    flexDirection: 'row',
    gap: SPACE.lg,
  },
  tilesBelow: {
    marginTop: SPACE.lg,
  },
  tile: {
    flex: 1,
    height: PROFILE_TAB_SIZES.tileHeight,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  pressed: {
    opacity: 0.8,
  },
  tileIcon: {
    width: PROFILE_TAB_SIZES.tileIconWidth,
    marginLeft: SPACE.md,
    alignItems: 'center',
  },
  tileLabel: {
    marginLeft: SPACE.xs,
    ...TYPE.bodyMedium,
  },
});
