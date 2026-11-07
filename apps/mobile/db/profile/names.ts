import { PROFILE_DEFAULTS } from '@/constants/profile';
import { STORAGE_KEYS } from '@/constants/storage';
import { getStrings, setString } from '@/db/appState/appState';
import { invalidateHistory } from '@/db/historyCache';

// Just the name and username (Home's header), without reading the history.
export async function getProfileNames(): Promise<{ name: string; username: string }> {
  const state = await getStrings([STORAGE_KEYS.profileName, STORAGE_KEYS.profileUsername]);
  const value = (key: string) => state.get(key);
  return { name: value(STORAGE_KEYS.profileName) ?? PROFILE_DEFAULTS.name, username: value(STORAGE_KEYS.profileUsername) ?? PROFILE_DEFAULTS.username };
}

export async function saveProfileNames(name: string, username: string): Promise<void> {
  await setString(STORAGE_KEYS.profileName, name);
  await setString(STORAGE_KEYS.profileUsername, username);
  invalidateHistory(); // getProfile has the names
}
