import type { TransactionDb } from './types';
// Every transaction goes through here, one after the other. expo-sqlite's
// withTransactionAsync is BEGIN / task / COMMIT on the one shared connection,
// with ROLLBACK when anything throws: a second transaction started while the
// first one runs fails on its BEGIN, and its ROLLBACK then cancels the FIRST
// one halfway (a half-saved workout, its draft deleted). So each waits its turn.
// Not re-entrant: a task must not start another transaction (it would wait for
// itself).


let queue: Promise<unknown> = Promise.resolve();

export function runInTransaction<T>(db: TransactionDb, task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    let result: T | undefined;
    await db.withTransactionAsync(async () => {
      result = await task();
    });
    return result as T;
  });
  // A failed transaction is the caller's to handle; the next one still runs.
  queue = run.catch(() => {});
  return run;
}

// Resolves once the transactions started so far are done (closing the
// database must not cut one short).
export function transactionsDone(): Promise<void> {
  return queue.then(() => {});
}
