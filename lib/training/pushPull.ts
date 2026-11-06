import { between } from '@/lib/stats/stats';
import {
  PULL_HEAVY_RATIO,
  PUSH_HEAVY_RATIO,
  PUSH_PULL_BALANCED_RATIO,
  PUSH_PULL_MIN_SETS,
} from '@/constants/training';
import { weeksBetween } from '@/lib/date';
import type { PushPull, PushPullSide, StatSet } from '@/types/stats';

// Push / Pull on Statistics → Muscle distribution. The catalogue's muscle
// labels get this wrong (face pulls and rear delt flyes are "shoulders", the
// shoulder press and chest fly list back muscles as helpers), so each exercise
// is push, pull or neither by its movement, and every set counts 1. Arms are
// kept apart: for the shoulders it is presses against rows and pulldowns that
// matters.

// By name, first match wins. Covers the user's exercises and the catalogue's
// usual names; anything else counts as neither, so it never lands on the wrong side.
const RULES: [PushPullSide, RegExp][] = [
  ['armPush', /tricep|pushdown|skull ?crusher|(?<!glute )kickback/],
  ['armPull', /(?<!leg |wrist )curls?\b/],
  ['pull', /(?<!upright )\brow\b|pulldown|pull-? ?ups?\b|chin-? ?ups?\b|face pull|rear delt|reverse fly|y[- ]raise/],
  ['push', /bench press|chest press|push-? ?ups?\b|\bdips?\b|\bfly|flye|shoulder press|overhead press|military press|front raise|arnold press/],
];

export function pushPullSide(name: string): PushPullSide | null {
  const n = name.toLowerCase();
  if (/wrist/.test(n)) return null;
  for (const [side, rule] of RULES) if (rule.test(n)) return side;
  return null;
}

export function pushPull(sets: StatSet[], from: Date, to: Date): PushPull {
  const weeks = weeksBetween(from, to);
  const out: PushPull = { push: 0, pull: 0, armPush: 0, armPull: 0 };
  const sides = new Map<string, PushPullSide | null>();
  for (const s of between(sets, from, to)) {
    if (!sides.has(s.name)) sides.set(s.name, pushPullSide(s.name));
    const side = sides.get(s.name);
    if (side) out[side] += 1;
  }
  for (const k of Object.keys(out) as PushPullSide[]) out[k] /= weeks;
  return out;
}

// One word for the card. Within PUSH_PULL_BALANCED_RATIO is Balanced; a bit more pull is fine
// (most coaches aim for at least as much pull as push).
export function balanceLabel(push: number, pull: number): string {
  if (push + pull < PUSH_PULL_MIN_SETS) return 'Not enough sets';
  if (push > PUSH_HEAVY_RATIO * pull) return 'Much more push';
  if (pull > PULL_HEAVY_RATIO * push) return 'Much more pull';
  if (push > PUSH_PULL_BALANCED_RATIO * pull) return 'More push';
  if (pull > PUSH_PULL_BALANCED_RATIO * push) return 'A bit more pull';
  return 'Balanced';
}

// The warning under the cards, only past the usual range: push over
// PUSH_HEAVY_RATIO × pull, or pull over PULL_HEAVY_RATIO × push. Swapping exercises, never adding sets (the user can't
// train harder).
export function balanceWarning(push: number, pull: number): string | null {
  if (push + pull < PUSH_PULL_MIN_SETS) return null;
  if (push > PUSH_HEAVY_RATIO * pull) {
    const times = pull > 0 ? `${(push / pull).toFixed(1)}×` : 'far above';
    return `Push is ${times} pull. Most coaches keep pull at least equal to push; swapping a press for a row would even it out.`;
  }
  if (pull > PULL_HEAVY_RATIO * push) {
    const times = push > 0 ? `${(pull / push).toFixed(1)}×` : 'far above';
    return `Pull is ${times} push. Chest and front shoulders get little work; swapping a row for a press would even it out.`;
  }
  return null;
}
