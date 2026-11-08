import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TransferTimeout, withStallTimeout } from './transfer';

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe('withStallTimeout', () => {
  it('rejects and aborts when a transfer never answers, even if it ignores the abort', async () => {
    let signal: AbortSignal | undefined;
    const stuck = withStallTimeout(30_000, (hooks) => {
      signal = hooks.signal;
      return new Promise<number>(() => {});
    });
    const outcome = expect(stuck).rejects.toBeInstanceOf(TransferTimeout);
    await vi.advanceTimersByTimeAsync(29_999);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await outcome;
    expect(signal?.aborted).toBe(true);
  });

  it('starts the clock again each time bytes move, so a long transfer that keeps moving finishes', async () => {
    const slow = withStallTimeout(30_000, async (hooks) => {
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 20_000));
        hooks.onProgress();
      }
      return 200;
    });
    await vi.advanceTimersByTimeAsync(200_000);
    expect(await slow).toBe(200);
  });

  it('gives back what the transfer answers, and its own errors', async () => {
    expect(await withStallTimeout(1000, async () => 200)).toBe(200);
    await expect(withStallTimeout(1000, async () => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    expect(vi.getTimerCount()).toBe(0);
  });
});
