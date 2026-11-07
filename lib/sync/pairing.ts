import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASYNC_STORAGE_KEYS, LOCAL_HOST_PATTERNS } from '@/constants/storage';
import type { Pairing } from '@/types/sync';

// Which PC this phone syncs with, read from the QR code in the Hevier Sync
// window. Kept outside the database, so a restore doesn't forget the PC.

// hevier://pair?host=192.168.1.23&port=4873&key=<32 hex>. Parsed by hand:
// React Native's URL has no searchParams.
export function parsePairLink(text: string): Pairing | null {
  const match = /^hevier:\/\/pair\?(.*)$/.exec(text.trim());
  if (!match) return null;
  let params: Map<string, string>;
  try {
    params = new Map(
      match[1].split('&').map((part) => {
        const [k, v = ''] = part.split('=');
        return [k, decodeURIComponent(v)] as const;
      })
    );
  } catch {
    return null;
  }
  const host = params.get('host') ?? '';
  const port = Number(params.get('port'));
  const key = params.get('key') ?? '';
  if (!/^[A-Za-z0-9.-]+$/.test(host) || !Number.isInteger(port) || port <= 0 || !/^[0-9a-f]{32}$/.test(key)) return null;
  return { host, port, key };
}

// True for a PC on the same network or cable: a pairing with any other host
// would send the whole backup out of the house.
export function isLocalHost(host: string): boolean {
  return LOCAL_HOST_PATTERNS.some((pattern) => pattern.test(host));
}

export async function getPairing(): Promise<Pairing | null> {
  const value = await AsyncStorage.getItem(ASYNC_STORAGE_KEYS.syncPairing);
  return value ? JSON.parse(value) : null;
}

export async function savePairing(pairing: Pairing): Promise<void> {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.syncPairing, JSON.stringify(pairing));
}

export function getLastSynced(): Promise<string | null> {
  return AsyncStorage.getItem(ASYNC_STORAGE_KEYS.syncLast);
}

export async function setLastSynced(iso: string): Promise<void> {
  await AsyncStorage.setItem(ASYNC_STORAGE_KEYS.syncLast, iso);
}

export function baseUrl(pairing: Pairing): string {
  return `http://${pairing.host}:${pairing.port}`;
}
