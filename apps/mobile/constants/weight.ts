// Weight units and where volume text switches to "k kg".
// Used by lib/format/weight.ts and the screens that call it.

export const KG_PER_THOUSAND = 1000; // "19k kg" is 19 x this

// From this total up, volume is written short ("19k kg") wherever space is
// tight: the Profile headline and chart, and the Muscle distribution card.
export const SHORT_VOLUME_FROM_KG = 1000;

// Body weight (Profile → Body weight). Exercises with this catalogue equipment
// that log reps only (pull-ups, dips, push-ups…) count the body weight as weight lifted.
export const BODY_WEIGHT_EQUIPMENT = 'body weight';
// What the Body weight field accepts, in kg.
export const BODY_WEIGHT_LIMITS = { minKg: 20, maxKg: 400 };
