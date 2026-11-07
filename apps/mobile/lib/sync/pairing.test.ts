import { describe, expect, it, vi } from 'vitest';

const stored = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => stored.get(k) ?? null,
    setItem: async (k: string, v: string) => void stored.set(k, v),
  },
}));
const { baseUrl, getLastSynced, getPairing, parsePairLink, savePairing, setLastSynced } = await import('./pairing');

const KEY = '0123456789abcdef0123456789abcdef';

describe('parsePairLink', () => {
  it('reads the link from the PC window', () => {
    expect(parsePairLink(`hevier://pair?host=192.168.1.23&port=4873&key=${KEY}`)).toEqual({
      host: '192.168.1.23',
      port: 4873,
      key: KEY,
    });
  });

  it('rejects anything else', () => {
    for (const text of [
      `https://pair?host=192.168.1.23&port=4873&key=${KEY}`,
      'hevier://pair?host=192.168.1.23&port=4873',
      `hevier://pair?host=192.168.1.23&port=abc&key=${KEY}`,
      'hevier://pair?host=192.168.1.23&port=4873&key=abc',
      `hevier://pair?port=4873&key=${KEY}`,
      `hevier://other?host=192.168.1.23&port=4873&key=${KEY}`,
      'hello',
    ]) {
      expect(parsePairLink(text), text).toBeNull();
    }
  });
});

describe('saved pairing', () => {
  it('remembers the PC and the last sync', async () => {
    expect(await getPairing()).toBeNull();
    expect(await getLastSynced()).toBeNull();
    await savePairing({ host: '10.0.2.2', port: 4873, key: KEY });
    await setLastSynced('2026-10-24T16:42:00.000Z');
    expect(await getPairing()).toEqual({ host: '10.0.2.2', port: 4873, key: KEY });
    expect(await getLastSynced()).toBe('2026-10-24T16:42:00.000Z');
  });

  it('builds the PC address', () => {
    expect(baseUrl({ host: '10.0.2.2', port: 4873, key: KEY })).toBe('http://10.0.2.2:4873');
  });
});
