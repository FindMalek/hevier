import { describe, expect, it } from 'vitest';
import { runInTransaction, transactionsDone } from './transaction';

// Like expo-sqlite's withTransactionAsync on one connection: BEGIN while a
// transaction is open fails, and the ROLLBACK that follows cancels the open one.
function fakeDb(log: string[]) {
  let open = false;
  const exec = async (sql: string) => {
    if (sql === 'BEGIN' && open) throw new Error('cannot start a transaction within a transaction');
    if (sql === 'BEGIN') open = true;
    if (sql === 'COMMIT' || sql === 'ROLLBACK') open = false;
    log.push(sql);
  };
  return {
    async withTransactionAsync(task: () => Promise<void>) {
      try {
        await exec('BEGIN');
        await task();
        await exec('COMMIT');
      } catch (e) {
        await exec('ROLLBACK');
        throw e;
      }
    },
  };
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

describe('runInTransaction', () => {
  it('runs two overlapping transactions one after the other', async () => {
    const log: string[] = [];
    const db = fakeDb(log);
    const step = (name: string) => async () => {
      log.push(`${name}1`);
      await tick();
      log.push(`${name}2`);
      return name;
    };
    const results = await Promise.all([runInTransaction(db, step('a')), runInTransaction(db, step('b'))]);
    expect(results).toEqual(['a', 'b']);
    expect(log).toEqual(['BEGIN', 'a1', 'a2', 'COMMIT', 'BEGIN', 'b1', 'b2', 'COMMIT']);
  });

  it('without the queue, the second one would cancel the first (the bug)', async () => {
    const log: string[] = [];
    const db = fakeDb(log);
    const first = db.withTransactionAsync(async () => {
      await tick();
      log.push('a');
    });
    await expect(db.withTransactionAsync(async () => {})).rejects.toThrow();
    await first;
    expect(log).toEqual(['BEGIN', 'ROLLBACK', 'a', 'COMMIT']); // "a" ran outside any transaction
  });

  it('a failed transaction is rolled back and the next one still runs', async () => {
    const log: string[] = [];
    const db = fakeDb(log);
    const failing = runInTransaction(db, async () => {
      await tick();
      throw new Error('boom');
    });
    const next = runInTransaction(db, async () => {
      log.push('next');
    });
    await expect(failing).rejects.toThrow('boom');
    await next;
    await transactionsDone();
    expect(log).toEqual(['BEGIN', 'ROLLBACK', 'BEGIN', 'next', 'COMMIT']);
  });
});
