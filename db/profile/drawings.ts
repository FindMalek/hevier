import { STORAGE_KEYS } from '@/constants/storage';
import { getString, setString } from '@/db/appState/appState';
import type { Drawings } from '@/types/profile';

// Which figure the exercise pictures show, kept in app_state; male until chosen.

export async function getDrawings(): Promise<Drawings> {
  return (await getString(STORAGE_KEYS.profileDrawings)) === 'female' ? 'female' : 'male';
}

export async function saveDrawings(drawings: Drawings): Promise<void> {
  await setString(STORAGE_KEYS.profileDrawings, drawings);
}
