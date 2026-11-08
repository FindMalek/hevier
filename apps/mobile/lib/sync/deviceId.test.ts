import { describe, expect, it, vi } from 'vitest';

const stored = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: async (k: string) => stored.get(k) ?? null, setItem: async (k: string, v: string) => void stored.set(k, v) },
}));
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `id${++nextId}` }));
const { adoptDeviceId, getDeviceId } = await import('./deviceId');

describe('device id', () => {
  it('is made once and kept outside the database', async () => {
    expect(await getDeviceId()).toBe('id1');
    expect(await getDeviceId()).toBe('id1');
    expect(stored.get('hevier.sync.deviceId')).toBe('id1');
  });

  it('takes the restored copy\'s id', async () => {
    await adoptDeviceId('phone-a');
    expect(await getDeviceId()).toBe('phone-a');
  });
});
