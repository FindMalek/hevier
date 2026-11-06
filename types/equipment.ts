import type { EQUIPMENT_GROUPS } from '@/constants/equipment';

// One of the equipment groups: one of EQUIPMENT_GROUPS.
export type EquipmentGroup = (typeof EQUIPMENT_GROUPS)[number];
