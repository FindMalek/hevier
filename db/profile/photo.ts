import { STORAGE_KEYS } from '@/constants/storage';
import { getString, remove, setString } from '@/db/appState/appState';

// The profile photo's file, kept in app_state.

export async function getProfilePhoto(): Promise<string | null> {
  return getString(STORAGE_KEYS.profilePhoto);
}

// null goes back to the initial.
export async function saveProfilePhoto(file: string | null): Promise<void> {
  if (file) await setString(STORAGE_KEYS.profilePhoto, file);
  else await remove(STORAGE_KEYS.profilePhoto);
}
