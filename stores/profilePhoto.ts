import { useSyncExternalStore } from 'react';
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { getProfilePhoto, saveProfilePhoto } from '@/db/profile/photo';
import { STORAGE_FOLDERS } from '@/constants/storage';

// The profile photo, shared by every Avatar: read once from app_state, then
// kept here, so avatars redraw only when it changes. The picked picture is
// copied into documents/profile under a new name each time (no stale image
// cache), and the old file is deleted.

let photo: string | null = null; // file uri
let loaded = false;
const listeners = new Set<() => void>();

function set(uri: string | null) {
  photo = uri;
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  if (!loaded) {
    loaded = true;
    getProfilePhoto()
      .then((file) => file && set(fileOf(file).uri))
      .catch((e) => console.warn('[photo] load failed', e));
  }
  return () => {
    listeners.delete(l);
  };
}

export function useProfilePhoto(): string | null {
  return useSyncExternalStore(subscribe, () => photo);
}

function fileOf(name: string) {
  return new File(Paths.document, STORAGE_FOLDERS.profile, name);
}

// The phone's photo picker with a square crop; false when nothing was picked.
export async function pickProfilePhoto(): Promise<boolean> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled) return false;
  const dir = new Directory(Paths.document, STORAGE_FOLDERS.profile);
  dir.create({ intermediates: true, idempotent: true });
  const name = `${Crypto.randomUUID()}.jpg`;
  await new File(result.assets[0].uri).copy(fileOf(name));
  await replace(name);
  return true;
}

export function removeProfilePhoto(): Promise<void> {
  return replace(null);
}

async function replace(name: string | null) {
  const old = await getProfilePhoto();
  await saveProfilePhoto(name);
  set(name && fileOf(name).uri);
  if (old && old !== name) {
    try {
      const file = fileOf(old);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('[photo] could not delete', old, e);
    }
  }
}
