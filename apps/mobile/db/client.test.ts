import { describe, expect, it, vi } from 'vitest';

// Two screens asking for the database at the same moment (app start) must
// share one connection: a second, discarded connection to the same file got
// cleaned up by Android and broke the one in use (NullPointerException in
// prepareAsync), losing the ✓ on completed sets.
const opened: { closed: boolean }[] = [];
const closing = { error: null as Error | null };
vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: vi.fn(async () => {
    const db = {
      closed: false,
      execAsync: async () => {},
      getFirstAsync: async () => ({ user_version: 99 }),
      withTransactionAsync: async (task: () => Promise<void>) => task(),
      closeAsync: async () => {
        if (closing.error) throw closing.error;
        db.closed = true;
      },
    };
    opened.push(db);
    return db;
  }),
}));

const { DataWaitingError, addBeforeOpen, closeDbAndHold, getDb } = await import('./client');
const { runInTransaction } = await import('./transaction');

const pause = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

describe('getDb', () => {
  it('opens one connection even when called several times at once', async () => {
    const [a, b, c] = await Promise.all([getDb(), getDb(), getDb()]);
    expect(opened).toHaveLength(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });
});

describe('closeDbAndHold', () => {
  it('closes the connection, and getDb waits until released, then opens the replaced file', async () => {
    const before = opened.length;
    const first = await getDb();
    const release = await closeDbAndHold();
    expect(opened[before - 1].closed).toBe(true);
    let answered = false;
    const pending = getDb().then((db) => {
      answered = true;
      return db;
    });
    await pause();
    expect(answered).toBe(false);
    expect(opened).toHaveLength(before);
    release();
    const second = await pending;
    expect(second).not.toBe(first);
    expect(opened).toHaveLength(before + 1);
  });

  it('waits for a transaction under way before closing', async () => {
    const db = await getDb();
    let finish = () => {};
    const transaction = runInTransaction(db as never, () => new Promise<void>((resolve) => (finish = resolve)));
    let held = false;
    const closed = closeDbAndHold().then((release) => {
      held = true;
      return release;
    });
    await pause();
    expect(held).toBe(false);
    finish();
    await transaction;
    (await closed)();
  });

  it('lets getDb through again when the close fails', async () => {
    await getDb();
    closing.error = new Error('close failed');
    await expect(closeDbAndHold()).rejects.toThrow('close failed');
    closing.error = null;
    await expect(Promise.race([getDb(), pause(200).then(() => 'stuck')])).resolves.not.toBe('stuck');
  });
});

describe('addBeforeOpen', () => {
  it('runs before every open, and a false answer keeps the file closed until it says true', async () => {
    const release = await closeDbAndHold();
    release();
    let ready = false;
    const seen: number[] = [];
    const remove = addBeforeOpen(async () => {
      seen.push(opened.length);
      return ready;
    });
    const before = opened.length;
    await expect(getDb()).rejects.toThrow(DataWaitingError);
    expect(opened).toHaveLength(before);
    ready = true;
    await getDb();
    expect(opened).toHaveLength(before + 1);
    expect(seen).toEqual([before, before]);
    remove();
  });

  it('a second task does not replace the first: either one saying false keeps the file closed', async () => {
    const release = await closeDbAndHold();
    release();
    const removeFirst = addBeforeOpen(async () => false);
    const removeSecond = addBeforeOpen(async () => true);
    const before = opened.length;
    await expect(getDb()).rejects.toThrow(DataWaitingError);
    expect(opened).toHaveLength(before);
    removeFirst();
    await getDb();
    expect(opened).toHaveLength(before + 1);
    removeSecond();
  });

  it('says what to do: Try again first, then closing the app', () => {
    expect(new DataWaitingError().message).toContain('Tap Try again');
  });
});
