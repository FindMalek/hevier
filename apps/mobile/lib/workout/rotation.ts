import type { CycleRoutine } from '@/types/routine';

// Index of the routine after the one last done; the first when none of them was done yet.
export function nextInCycle(routines: CycleRoutine[], lastTitle: string | null): number {
  const i = lastTitle === null ? -1 : routines.findIndex((r) => r.name === lastTitle);
  return (i + 1) % routines.length;
}
