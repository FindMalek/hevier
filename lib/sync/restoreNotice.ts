import AsyncStorage from '@react-native-async-storage/async-storage';

import { ASYNC_STORAGE_KEYS } from '@/constants/storage';

// A restore the app was closed in is undone at the next start (lib/sync/expoIO.ts)
// and the user is told once. The note is kept outside the database, which is
// closed until the old data is back.

export async function noteUnfinishedRestore(): Promise<void> {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.restoreUndone, '1');
}

// True once per note: reading it clears it.
export async function takeUnfinishedRestoreNotice(): Promise<boolean> {
  if (!(await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.restoreUndone))) return false;
  await AsyncStorage.removeItem(ASYNC_STORAGE_KEYS.restoreUndone);
  return true;
}

export const UNFINISHED_RESTORE_NOTICE = {
  title: 'The restore did not finish',
  message: 'Hevier was closed before the restore finished, so your phone has the data it had before. Restore from the PC again to retry.',
};
