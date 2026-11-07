import { EQUIPMENT_OF } from '@/constants/equipment';
import { MUSCLE_OF_SECONDARY, MUSCLE_OF_TARGET } from '@/constants/muscles';
import type { EquipmentGroup } from '@/types/equipment';
import type { MuscleGroup } from '@/types/muscles';

// Catalogue words (target muscle, body part, secondary muscles, equipment)
// turned into the app's groups. The tables are in constants/muscles.ts and
// constants/equipment.ts.

export function muscleGroup(target: string | null, bodyPart: string | null): MuscleGroup {
  if (bodyPart === 'full body') return 'Full Body';
  return (target && MUSCLE_OF_TARGET[target]) || 'Other';
}

export function equipmentGroup(equipment: string | null): EquipmentGroup {
  return (equipment && EQUIPMENT_OF[equipment]) || 'Other';
}

// An exercise's secondary muscles as groups, without the primary or repeats.
export function secondaryGroups(names: string[], primary: MuscleGroup): MuscleGroup[] {
  const out: MuscleGroup[] = [];
  for (const n of names) {
    const g = MUSCLE_OF_SECONDARY[n.toLowerCase()];
    if (g && g !== primary && !out.includes(g)) out.push(g);
  }
  return out;
}

// A JSON list column (secondary muscles, instructions) as strings; missing,
// not a list, or bad JSON gives an empty list.
export function parseList(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
