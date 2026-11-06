import { RECENT_EXERCISES_LIMIT } from '@/constants/training';
import { PICKER_SECTION_LABELS } from '@/constants/labels';
import type { EquipmentGroup } from '@/types/equipment';
import type { MuscleGroup } from '@/types/muscles';
import type { PickerExercise, PickerQuery, PickerSection } from '@/types/exercise';

// The exercise picker's search, filters, Recent and Suggested, worked out in
// memory from the list db/exercisePicker/pickerExercises.ts loads.

// The All Equipment / All Muscles filters: an exercise passes when it is in
// one of the picked groups of each filter (an empty filter lets all through).
export function filterExercises(
  all: PickerExercise[],
  equipment: readonly EquipmentGroup[],
  muscles: readonly MuscleGroup[]
): PickerExercise[] {
  if (equipment.length === 0 && muscles.length === 0) return all;
  return all.filter(
    (e) =>
      (equipment.length === 0 || equipment.includes(e.equipment)) &&
      (muscles.length === 0 || muscles.includes(e.muscle))
  );
}

// Recent Exercises: done before, latest first.
export function recentExercises(all: PickerExercise[], limit = RECENT_EXERCISES_LIMIT): PickerExercise[] {
  return all
    .filter((e) => e.lastDone)
    .sort((a, b) => b.lastDone!.localeCompare(a.lastDone!))
    .slice(0, limit);
}

// Every word typed must appear somewhere in the name, in any order ("curl dumb"
// finds "Bicep Curl (Dumbbell)"). Exercises already done come first, then A-Z.
// Names are lowercased once per list (each keystroke searches ~5,600 of them),
// and sorted with a collator: the same order as localeCompare, built once.
export function searchExercises(all: PickerExercise[], query: string): PickerExercise[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return all;
  let names = lowerNames.get(all);
  if (!names) {
    names = all.map((e) => e.name.toLowerCase());
    lowerNames.set(all, names);
  }
  const found: PickerExercise[] = [];
  names.forEach((name, i) => {
    if (words.every((w) => name.includes(w))) found.push(all[i]);
  });
  return found.sort((a, b) => b.timesDone - a.timesDone || collator.compare(a.name, b.name));
}

const lowerNames = new WeakMap<PickerExercise[], string[]>();
const collator = new Intl.Collator();

// Suggested Exercises when replacing: the same muscle, the most done first.
export function suggestedExercises(all: PickerExercise[], replacing: { id: string; muscle: MuscleGroup }, limit = 3) {
  return all
    .filter((e) => e.id !== replacing.id && e.muscle === replacing.muscle)
    .sort((a, b) => b.timesDone - a.timesDone || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// The picker's list: while searching, one untitled section of matches; else
// Suggested (when replacing), Recent, then All. Empty sections are left out.
export function pickerSections(all: PickerExercise[], q: PickerQuery): PickerSection[] {
  const shown = filterExercises(all, q.equipment, q.muscles);
  if (q.search.trim()) {
    const found = searchExercises(shown, q.search);
    return found.length ? [{ title: '', data: found }] : [];
  }
  const out: PickerSection[] = [];
  if (q.replacingId) {
    const current = all.find((e) => e.id === q.replacingId);
    const suggested = current ? suggestedExercises(shown, current) : [];
    if (suggested.length) out.push({ title: PICKER_SECTION_LABELS.suggested, data: suggested });
  }
  const recent = recentExercises(shown);
  if (recent.length) out.push({ title: PICKER_SECTION_LABELS.recent, data: recent });
  if (shown.length) out.push({ title: PICKER_SECTION_LABELS.all, data: shown });
  return out;
}

// "Show N results" in a filter sheet: how many the list would show.
export function pickerCount(all: PickerExercise[], q: PickerQuery): number {
  const shown = filterExercises(all, q.equipment, q.muscles);
  return q.search.trim() ? searchExercises(shown, q.search).length : shown.length;
}
