import type { DragListItem, RoutineOverview, RoutineSummary } from '@/types/routine';

// The Workout tab's list as the routine drag sees it (components/routines/RoutineDrag.tsx),
// and where a drop lands in it. Kept apart from the gesture code so it can be tested.

// The list as one flat run: each folder's name, its cards (or the empty box
// when it has none; nothing when folded), then My Routines last.
export function buildDragItems(overview: RoutineOverview): DragListItem[] {
  const out: DragListItem[] = [];
  const section = (folderId: string | null, collapsed: boolean, routines: RoutineSummary[]) => {
    out.push({ key: `folder:${folderId ?? 'mine'}`, kind: 'header', folderId, collapsed });
    if (collapsed) return;
    if (routines.length === 0) out.push({ key: `box:${folderId ?? 'mine'}`, kind: 'box', folderId });
    for (const r of routines) out.push({ key: r.id, kind: 'card', folderId });
  };
  for (const f of overview.folders) section(f.id, f.collapsed, f.routines);
  section(null, overview.unfiledCollapsed, overview.unfiled);
  return out;
}

// Every routine by id, in folders or not.
export function routinesById(overview: RoutineOverview): Map<string, RoutineSummary> {
  return new Map([...overview.folders.flatMap((f) => f.routines), ...overview.unfiled].map((r) => [r.id, r]));
}

// Where (folder, index) an insertion point `t` in the list without the
// dragged item `s` falls: after a folder's name = first in it (last when
// folded), after a card = right after it.
export function dropTarget(items: DragListItem[], s: number, t: number): { folderId: string | null; index: number } {
  const rest = items.filter((_, i) => i !== s);
  const before = rest[Math.max(0, t - 1)];
  if (!before) return { folderId: null, index: 0 };
  if (before.kind === 'header') return { folderId: before.folderId, index: before.collapsed ? Number.MAX_SAFE_INTEGER : 0 };
  if (before.kind === 'box') return { folderId: before.folderId, index: 0 };
  let index = 0;
  for (let i = 0; i < Math.max(0, t - 1); i++) {
    if (rest[i].kind === 'card' && rest[i].folderId === before.folderId) index++;
  }
  return { folderId: before.folderId, index: index + 1 };
}
