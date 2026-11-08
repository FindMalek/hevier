import type { TransferHooks } from '@/types/sync';

// A file transfer that stopped moving. The sync and restore answer 'timeout'.
export class TransferTimeout extends Error {
  constructor() {
    super('transfer stalled');
    this.name = 'TransferTimeout';
  }
}

// Runs a file transfer with a stall timeout: `onProgress` (called as bytes
// move) restarts the clock, and when it runs out the transfer is aborted and
// this rejects with TransferTimeout. It rejects even if the transfer ignores
// the abort and never settles, so whoever holds the sync lock always gets it
// back. There is no limit on the whole transfer, only on how long it stands still.
export async function withStallTimeout<T>(stallMs: number, run: (hooks: TransferHooks) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stalled: (e: TransferTimeout) => void = () => {};
  const timeout = new Promise<never>((_, reject) => {
    stalled = reject;
  });
  const arm = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      controller.abort();
      stalled(new TransferTimeout());
    }, stallMs);
  };
  arm();
  try {
    return await Promise.race([run({ signal: controller.signal, onProgress: arm }), timeout]);
  } finally {
    clearTimeout(timer);
  }
}
