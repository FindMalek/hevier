import { EquipmentIcon, MuscleIcon } from '@/components/exercises/FilterIcons';
import { EQUIPMENT_GROUPS } from '@/constants/equipment';
import { MUSCLE_SECTION_LABELS } from '@/constants/labels';
import { LOWER_BODY_MUSCLES, OTHER_MUSCLES, UPPER_BODY_MUSCLES } from '@/constants/muscles';
import type { MuscleGroup } from '@/types/muscles';

// The options of the picker's two filter sheets (components/exercises/FilterSheet.tsx).

export const EQUIPMENT_SECTIONS = [
  { options: EQUIPMENT_GROUPS.map((key) => ({ key, icon: <EquipmentIcon group={key} /> })) },
];

const muscleOptions = (keys: readonly MuscleGroup[]) => keys.map((key) => ({ key, icon: <MuscleIcon group={key} /> }));

// The sheet: Upper Body, Lower Body, then the rest.
export const MUSCLE_SECTIONS = [
  { title: MUSCLE_SECTION_LABELS.upperBody, options: muscleOptions(UPPER_BODY_MUSCLES) },
  { title: MUSCLE_SECTION_LABELS.lowerBody, options: muscleOptions(LOWER_BODY_MUSCLES) },
  { title: MUSCLE_SECTION_LABELS.other, options: muscleOptions(OTHER_MUSCLES) },
];
