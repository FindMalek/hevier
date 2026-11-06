import type { RoutineOverview, RoutineSummary } from '@/types/routine';

// The Workout tab's lists with a routine moved, as moveRoutine (db/routines/folders.ts)
// saves it: shown at once when a dragged routine is dropped, before the save is done.
export function movedOverview(o: RoutineOverview, routineId: string, folderId: string | null, index: number): RoutineOverview {
  const all = [...o.folders.flatMap((f) => f.routines), ...o.unfiled];
  const routine = all.find((r) => r.id === routineId);
  if (!routine) return o;
  const without = (list: RoutineSummary[]) => list.filter((r) => r.id !== routineId);
  const insert = (list: RoutineSummary[]) => {
    const rest = without(list);
    rest.splice(Math.max(0, Math.min(index, rest.length)), 0, routine);
    return rest;
  };
  return {
    ...o,
    folders: o.folders.map((f) => ({ ...f, routines: f.id === folderId ? insert(f.routines) : without(f.routines) })),
    unfiled: folderId === null ? insert(o.unfiled) : without(o.unfiled),
  };
}
