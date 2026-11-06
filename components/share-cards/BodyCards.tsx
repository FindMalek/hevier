import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'phosphor-react-native/src/icons/Check';

import { COLORS, FONTS, SHARE_COLORS, TYPE } from '@/constants/theme';
import { RADIUS, SPACE } from '@/constants/layout';
import { ICON_SIZES, SHARE_CARDS_SIZES } from '@/constants/sizes';
import { SHARE_CARDS_LIMITS } from '@/constants/limits';
import { weekdayLetter } from '@/lib/format/date';
import { plural } from '@/lib/format/text';
import { MuscleMapBody } from '@/components/body/MuscleMapBody';
import { ShareCard } from './ShareCard';
import { exerciseLines } from './shareCardMaths';
import { shared } from './styles';
import type { BodyCardProps, ExercisesCardProps } from './types';

// The cards with the muscle map: Body and Exercises.

// The muscles this workout hit, then the 7 days up to it with a tick on each
// day trained and "You worked out 4 times in the last 7 days".
export const BodyCard = memo(function BodyCard({ size, username, muscles, days, times }: BodyCardProps) {
  return (
    <ShareCard size={size} username={username} centered footer>
      <MuscleMapBody colorOf={muscles} height={size * 0.4} />
      <View style={styles.weekLetters}>
        {days.map((d, i) => (
          <Text key={i} style={styles.weekLetter}>
            {weekdayLetter(d.date)}
          </Text>
        ))}
      </View>
      <View style={styles.week}>
        {days.map((d, i) => (
          <View key={i} style={styles.weekCell}>
            {d.trained ? (
              <View style={styles.tick}>
                <Check size={ICON_SIZES.sm} weight="bold" color={COLORS.text} />
              </View>
            ) : (
              <View style={styles.noTick} />
            )}
          </View>
        ))}
      </View>
      <Text style={styles.weekLine}>
        You worked out <Text style={styles.bold}>{`${times} ${plural(times, 'time')}`}</Text> in the last 7 days
      </Text>
    </ShareCard>
  );
});

// The exercises card: the title and every exercise ("3x Lateral Raise")
// on the left, the worked muscles front above back on the right.
export const ExercisesCard = memo(function ExercisesCard({ size, username, workout, muscles }: ExercisesCardProps) {
  const { shown, more } = exerciseLines(workout.exercises, SHARE_CARDS_LIMITS.exercisesCardExercises);
  return (
    <ShareCard size={size} username={username}>
      <View style={styles.exercisesRow}>
        <View style={styles.exercisesText}>
          <Text style={styles.exercisesTitle} numberOfLines={1}>
            {workout.title}
          </Text>
          <View style={styles.exercisesList}>
            {shown.map((e, i) => (
              <Text key={i} style={styles.exercisesLine} numberOfLines={1}>
                <Text style={shared.count}>{e.sets.length}x </Text>
                {e.name}
              </Text>
            ))}
            {more > 0 && (
              <Text style={shared.listMore}>
                ...and {more} more {plural(more, 'exercise')}
              </Text>
            )}
          </View>
        </View>
        <MuscleMapBody colorOf={muscles} height={size * 0.31} vertical />
      </View>
    </ShareCard>
  );
});

const styles = StyleSheet.create({
  exercisesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exercisesText: {
    flex: 1,
    marginRight: SPACE.sm,
  },
  exercisesTitle: {
    ...TYPE.displaySemibold,
  },
  exercisesList: {
    marginTop: SPACE.sm,
    gap: SPACE.sm,
  },
  exercisesLine: {
    ...TYPE.body,
  },
  weekLetters: {
    marginTop: SPACE.md,
    flexDirection: 'row',
  },
  weekLetter: {
    width: SHARE_CARDS_SIZES.weekCell,
    textAlign: 'center',
    ...TYPE.smallMedium,
  },
  week: {
    marginTop: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderRadius: 24,
    flexDirection: 'row',
    backgroundColor: SHARE_COLORS.weekBg,
  },
  weekCell: {
    width: SHARE_CARDS_SIZES.weekCell,
    height: SHARE_CARDS_SIZES.weekCellHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tick: {
    width: SHARE_CARDS_SIZES.tickWidth,
    height: SHARE_CARDS_SIZES.tickHeight,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  noTick: {
    width: SHARE_CARDS_SIZES.noTickWidth,
    height: SHARE_CARDS_SIZES.noTickHeight,
    borderRadius: RADIUS.round,
    backgroundColor: SHARE_COLORS.radarAxis,
  },
  weekLine: {
    marginTop: SPACE.md,
    ...TYPE.small,
  },
  bold: {
    fontFamily: FONTS.bold,
  },
});
