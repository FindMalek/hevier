import type { BODY_PARTS, MUSCLE_GROUPS, RADAR_MUSCLES } from '@/constants/muscles';

// One of the muscle groups: one of MUSCLE_GROUPS.
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

// A body part on the "Nice work!" radar card: one of BODY_PARTS.
export type BodyPart = (typeof BODY_PARTS)[number];

// A muscle on the Muscle distribution radar: one of RADAR_MUSCLES.
export type RadarMuscle = (typeof RADAR_MUSCLES)[number];
