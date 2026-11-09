import * as Crypto from 'expo-crypto';
import { getDb } from '@/db/client';
import { runInTransaction } from '@/db/transaction';
import { STORAGE_KEYS } from '@/constants/storage';
import { getString, setString } from '@/db/appState/appState';
import type { Folder, RoutineFolder, RoutineOverview, RoutineSummary } from '@/types/routine';
import {
  DELETE_FOLDER,
  INSERT_FOLDER_ON_TOP,
  MOVE_FOLDER_ROUTINES_TO_UNFILED,
  SELECT_FOLDERS,
  SELECT_NEXT_UNFILED_POSITION,
  SELECT_OTHER_ROUTINES_IN_FOLDER,
  SELECT_ROUTINES_WITH_EXERCISES,
  UPDATE_FOLDER_COLLAPSED,
  UPDATE_FOLDER_NAME,
  UPDATE_FOLDER_POSITION,
  UPDATE_ROUTINE_FOLDER,
  UPDATE_ROUTINE_POSITION,
} from './queries';
import type { FolderRow, NextPositionRow, RoutineExerciseNameRow, RoutineIdRow } from './rows';

// Everything the Workout tab shows, in order.
export async function getRoutineOverview(): Promise<RoutineOverview> {
  const db = await getDb();
  const folderRows = await db.getAllAsync<FolderRow>(SELECT_FOLDERS);
  const rows = await db.getAllAsync<RoutineExerciseNameRow>(SELECT_ROUTINES_WITH_EXERCISES);
  const unfiledCollapsed = await getString(STORAGE_KEYS.routinesUnfiledCollapsed, db);

  const folders: RoutineFolder[] = folderRows.map((f) => ({ id: f.id, name: f.name, collapsed: f.collapsed === 1, routines: [] }));
  const folderById = new Map(folders.map((f) => [f.id, f]));
  const unfiled: RoutineSummary[] = [];
  const routineById = new Map<string, RoutineSummary>();
  for (const row of rows) {
    let routine = routineById.get(row.id);
    if (!routine) {
      routine = { id: row.id, name: row.name, exerciseNames: [] };
      routineById.set(row.id, routine);
      const folder = row.folder_id ? folderById.get(row.folder_id) : undefined;
      (folder ? folder.routines : unfiled).push(routine);
    }
    if (row.exercise) routine.exerciseNames.push(row.exercise);
  }
  return { folders, unfiled, unfiledCollapsed: unfiledCollapsed === '1' };
}

// folderId null = the built-in "My Routines" section.
export async function setFolderCollapsed(folderId: string | null, collapsed: boolean): Promise<void> {
  const db = await getDb();
  if (folderId) {
    await db.runAsync(UPDATE_FOLDER_COLLAPSED, [collapsed ? 1 : 0, folderId]);
  } else {
    await setString(STORAGE_KEYS.routinesUnfiledCollapsed, collapsed ? '1' : '0', db);
  }
}

// A new folder goes above the existing ones.
export async function createFolder(name: string): Promise<Folder> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  await db.runAsync(INSERT_FOLDER_ON_TOP, [id, name]);
  return { id, name };
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(UPDATE_FOLDER_NAME, [name, id]);
}

// Deleting a folder moves its routines into "My Routines". They keep their order and go after the routines already there.
export async function deleteFolder(id: string): Promise<void> {
  const db = await getDb();
  await runInTransaction(db, async () => {
    const end = await db.getFirstAsync<NextPositionRow>(SELECT_NEXT_UNFILED_POSITION);
    await db.runAsync(MOVE_FOLDER_ROUTINES_TO_UNFILED, [end?.next ?? 0, id]);
    await db.runAsync(DELETE_FOLDER, [id]);
  });
}

// `ids` is every folder, top to bottom.
export async function reorderFolders(ids: string[]): Promise<void> {
  const db = await getDb();
  await runInTransaction(db, async () => {
    for (const [position, id] of ids.entries()) {
      await db.runAsync(UPDATE_FOLDER_POSITION, [position, id]);
    }
  });
}

// Dragging a routine on the Workout tab: into `folderId` (null = My Routines)
// at `index` among that folder's other routines; the folder is renumbered.
// lib/workout/routineOverview.ts movedOverview shows the same move at once.
export async function moveRoutine(routineId: string, folderId: string | null, index: number): Promise<void> {
  const db = await getDb();
  await runInTransaction(db, async () => {
    const others = await db.getAllAsync<RoutineIdRow>(SELECT_OTHER_ROUTINES_IN_FOLDER, [folderId, routineId]);
    const ids = others.map((r) => r.id);
    ids.splice(Math.max(0, Math.min(index, ids.length)), 0, routineId);
    await db.runAsync(UPDATE_ROUTINE_FOLDER, [folderId, routineId]);
    for (const [position, id] of ids.entries()) {
      await db.runAsync(UPDATE_ROUTINE_POSITION, [position, id]);
    }
  });
}
