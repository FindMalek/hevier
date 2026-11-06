import { describe, expect, it } from 'vitest';

import { buildDragItems, dropTarget, routinesById } from './routineDrop';
import type { DragListItem, RoutineOverview } from '@/types/routine';

// My routine: A, B, C · Test (empty) · Legs (folded) · My Routines: F
const items: DragListItem[] = [
  { key: 'folder:f1', kind: 'header', folderId: 'f1' },
  { key: 'A', kind: 'card', folderId: 'f1' },
  { key: 'B', kind: 'card', folderId: 'f1' },
  { key: 'C', kind: 'card', folderId: 'f1' },
  { key: 'folder:t', kind: 'header', folderId: 't' },
  { key: 'box:t', kind: 'box', folderId: 't' },
  { key: 'folder:l', kind: 'header', folderId: 'l', collapsed: true },
  { key: 'folder:mine', kind: 'header', folderId: null },
  { key: 'F', kind: 'card', folderId: null },
];

describe('dropTarget', () => {
  it('within a folder: right after the card before the gap', () => {
    // Dragging A (index 1) to after B: without A the list is header, B, C…; t = 2.
    expect(dropTarget(items, 1, 2)).toEqual({ folderId: 'f1', index: 1 });
    // Back to the top, right under the folder's name.
    expect(dropTarget(items, 2, 1)).toEqual({ folderId: 'f1', index: 0 });
  });

  it('into an empty folder, a folded one (last), or My Routines', () => {
    expect(dropTarget(items, 8, 5)).toEqual({ folderId: 't', index: 0 }); // after Test's name
    expect(dropTarget(items, 8, 6)).toEqual({ folderId: 't', index: 0 }); // after its empty box
    expect(dropTarget(items, 1, 6)).toEqual({ folderId: 'l', index: Number.MAX_SAFE_INTEGER });
    expect(dropTarget(items, 1, 8)).toEqual({ folderId: null, index: 1 }); // after F
  });
});

describe('drag list', () => {
  const r = (id: string) => ({ id, name: id, exerciseNames: [] });
  const overview: RoutineOverview = {
    folders: [
      { id: 'f1', name: 'Push', collapsed: false, routines: [r('A'), r('B')] },
      { id: 't', name: 'Test', collapsed: false, routines: [] },
      { id: 'l', name: 'Legs', collapsed: true, routines: [r('D')] },
    ],
    unfiled: [r('F')],
    unfiledCollapsed: false,
  };

  it('lists each folder, its cards or empty box, then My Routines', () => {
    expect(buildDragItems(overview).map((i) => i.key)).toEqual([
      'folder:f1',
      'A',
      'B',
      'folder:t',
      'box:t',
      'folder:l',
      'folder:mine',
      'F',
    ]);
  });

  it('marks folded folders and gives each item its folder', () => {
    const items = buildDragItems(overview);
    expect(items.find((i) => i.key === 'folder:l')?.collapsed).toBe(true);
    expect(items.find((i) => i.key === 'F')?.folderId).toBeNull();
  });

  it('finds routines by id, folded ones too', () => {
    expect([...routinesById(overview).keys()]).toEqual(['A', 'B', 'D', 'F']);
  });
});
