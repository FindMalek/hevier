import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { ASYNC_STORAGE_KEYS } from '@/constants/storage';

// Which phone a copy on the PC came from. Kept outside the database, so a
// database copied onto another device (an emulator) never passes for this
// phone: that device makes its own id, and the PC asks before letting it
// replace the phone's copy. A Restore from the PC takes the copy's id on
// purpose, so a restored phone carries on as the same phone.

export async function getDeviceId(): Promise<string> {
  const saved = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.syncDeviceId);
  if (saved) return saved;
  const id = Crypto.randomUUID();
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.syncDeviceId, id);
  return id;
}

export async function adoptDeviceId(id: string): Promise<void> {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.syncDeviceId, id);
}
