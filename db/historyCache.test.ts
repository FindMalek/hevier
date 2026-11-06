import { describe, expect, it } from 'vitest';
import { cached, invalidateHistory } from './historyCache';

describe('history cache', () => {
  it('loads once and shares the result until invalidated', async () => {
    let loads = 0;
    const load = async () => ({ n: ++loads });
    const [a, b] = await Promise.all([cached('k', load), cached('k', load)]);
    expect(a).toBe(b);
    expect(loads).toBe(1);
    invalidateHistory();
    expect(await cached('k', load)).toEqual({ n: 2 });
  });

  it('does not keep a failed load', async () => {
    await expect(cached('fails', async () => Promise.reject(new Error('x')))).rejects.toThrow();
    expect(await cached('fails', async () => 'ok')).toBe('ok');
  });
});
