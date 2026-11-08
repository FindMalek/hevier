import { useSyncExternalStore } from 'react';

import { getDrawings, saveDrawings } from '@/db/profile/drawings';
import type { Drawings } from '@/types/profile';

// The chosen exercise figure, shared by every exercise picture: read once from
// app_state, then kept here, so pictures redraw only when it changes.

let drawings: Drawings = 'male';
let loaded = false;
const listeners = new Set<() => void>();

function set(value: Drawings) {
  drawings = value;
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!loaded) {
    loaded = true;
    getDrawings()
      .then(set)
      .catch((e) => console.warn('[drawings] load failed', e));
  }
  return () => {
    listeners.delete(l);
  };
}

export function useDrawings(): Drawings {
  return useSyncExternalStore(subscribe, () => drawings);
}

// For code outside React (the workout notification's picture).
export function currentDrawings(): Drawings {
  return drawings;
}

export async function setDrawings(value: Drawings): Promise<void> {
  await saveDrawings(value);
  loaded = true;
  set(value);
}
