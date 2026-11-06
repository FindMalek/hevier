import { useState } from 'react';
import { Modal } from 'react-native';

import { ExerciseThumb } from '@/components/exercises/ExerciseThumb';
import { HeaderTextButton, InnerHeader } from '@/components/ui/InnerHeader';
import { ReorderList } from '@/components/ui/ReorderList';
import { REORDER_EXERCISES_SIZES } from '@/constants/sizes';
import type { ReorderItem } from '@/types/ui';
import { Screen } from '@/components/ui/Screen';
import type { ReorderExercisesProps } from './types';

// "Reorder Exercises" from an exercise's ⋮ menu. It looks like Reorder Folders, with each exercise's picture. Full screen
// over Log Workout; the new order applies only on Done, ← leaves it as it was.
export function ReorderExercises({
  exercises,
  visible,
  onDone,
  onCancel,
}: ReorderExercisesProps) {
  const [items, setItems] = useState<ReorderItem[]>([]);
  // Start from the workout's order each time it opens.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setItems(
        exercises.map((e) => ({ id: e.key, label: e.name, left: <ExerciseThumb catalogueId={e.catalogueId} size={REORDER_EXERCISES_SIZES.exerciseThumb} /> }))
      );
    }
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <Screen>
        <InnerHeader
          title="Reorder Exercises"
          onBack={onCancel}
          right={<HeaderTextButton label="Done" onPress={() => onDone(items.map((i) => i.id))} />}
        />
        <ReorderList items={items} onChange={setItems} />
      </Screen>
    </Modal>
  );
}
