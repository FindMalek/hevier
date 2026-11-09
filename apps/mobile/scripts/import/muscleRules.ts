import { COMBO, MUSCLE_RULES, RULE_CATEGORIES } from '@/constants/muscleRules';
import { MUSCLE_OF_SECONDARY, MUSCLE_OF_TARGET } from '@/constants/muscles';
import type { CatalogueEntry, MuscleRule } from '@/types/import';

// The rule for an exercise's movement, if any (see constants/muscleRules.ts).
export function ruleFor(e: CatalogueEntry): MuscleRule | null {
  if (!RULE_CATEGORIES.includes(e.category ?? '')) return null;
  const name = e.name.toLowerCase();
  if (COMBO.test(name)) return null;
  const rule = MUSCLE_RULES.find((r) => r.match.test(name) && !r.exclude?.test(name));
  // The name says the movement, the main muscle must agree (a lunge "with
  // biceps curl" is not a curl).
  return rule && e.target && rule.targets.includes(e.target) ? rule : null;
}

// The exercise with its movement's muscle fixes applied.
export function applyMuscleRules(e: CatalogueEntry): CatalogueEntry {
  const rule = ruleFor(e);
  if (!rule) return e;
  const target = e.target ?? '';
  const primary = MUSCLE_OF_TARGET[target];
  const secondary = (e.secondaryMuscles ?? []).filter((w) => {
    const g = MUSCLE_OF_SECONDARY[w.toLowerCase()];
    return !g || !rule.drop.includes(g);
  });
  for (const [group, word] of Object.entries(rule.need)) {
    if (group === primary) continue;
    if (!secondary.some((w) => MUSCLE_OF_SECONDARY[w.toLowerCase()] === group)) secondary.push(word);
  }
  return { ...e, secondaryMuscles: secondary };
}
