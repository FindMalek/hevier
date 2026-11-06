import type { WeightComparison } from '@/types/stats';

// The "Nice work!" weight card: the heaviest thing a workout's volume
// reaches. Rough real weights, lightest first.
const THINGS: { kg: number; name: string; emoji: string }[] = [
  { kg: 4, name: 'cat', emoji: '🐈' },
  { kg: 30, name: 'dog', emoji: '🐕' },
  { kg: 100, name: 'panda', emoji: '🐼' },
  { kg: 300, name: 'piano', emoji: '🎹' },
  { kg: 500, name: 'horse', emoji: '🐎' },
  { kg: 700, name: 'cow', emoji: '🐄' },
  { kg: 1500, name: 'car', emoji: '🚗' },
  { kg: 1800, name: 'hippo', emoji: '🦛' },
  { kg: 2300, name: 'rhino', emoji: '🦏' },
  { kg: 5000, name: 'elephant', emoji: '🐘' },
  { kg: 7000, name: 'T-rex', emoji: '🦖' },
  { kg: 12000, name: 'bus', emoji: '🚌' },
  { kg: 30000, name: 'humpback whale', emoji: '🐋' },
  { kg: 100000, name: 'locomotive', emoji: '🚂' },
  { kg: 150000, name: 'blue whale', emoji: '🐳' },
];

export function weightComparison(volumeKg: number): WeightComparison | null {
  const thing = [...THINGS].reverse().find((t) => volumeKg >= t.kg);
  if (!thing) return null;
  const article = /^[aeiou]/i.test(thing.name) ? 'an' : 'a';
  return { name: thing.name, emoji: thing.emoji, line: `That's like lifting ${article} ${thing.name}!` };
}
