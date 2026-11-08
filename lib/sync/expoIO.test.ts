import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-io-'));

// What breaks next, by file or folder name; each entry fires once.
const failing = { copy: '', moveAside: '', moveBack: '', deleteBackup: '', stuck: '' };

function breakOnce(key: keyof typeof failing, name: string): boolean {
  if (failing[key] !== name) return false;
  failing[key] = '';
  return true;
}

// expo-file-system on top of node's fs, with the SDK's rules: a move into an
// existing directory goes inside it, and a copy or move onto something that
// already exists throws.
vi.mock('expo-file-system', () => {
  type Part = string | { path: string };
  const join = (parts: Part[]) => path.join(...parts.map((p) => (typeof p === 'string' ? p : p.path)));
  class Entry {
    path: string;
    constructor(...parts: Part[]) {
      this.path = join(parts);
    }
    get exists() {
      return fs.existsSync(this.path);
    }
    get name() {
      return path.basename(this.path);
    }
    delete() {
      if (breakOnce('deleteBackup', this.name)) throw new Error('cannot delete');
      if (failing.stuck && this.name === failing.stuck) throw new Error('cannot delete, ever');
      fs.rmSync(this.path, { recursive: true });
    }
    moveSync(dest: Entry) {
      const into = dest instanceof Directory && dest.exists;
      const target = into ? path.join(dest.path, this.name) : dest.path;
      if (target.includes('restore-backup') && breakOnce('moveAside', this.name)) throw new Error('cannot move aside');
      if (this.path.includes('restore-backup') && breakOnce('moveBack', this.name)) throw new Error('cannot move back');
      if (!fs.existsSync(path.dirname(target))) throw new Error('destination does not exist');
      if (fs.existsSync(target)) throw new Error('destination already exists');
      fs.renameSync(this.path, target);
      this.path = target;
    }
  }
  class File extends Entry {
    create() {
      fs.writeFileSync(this.path, '', { flag: 'wx' });
    }
    copySync(dest: File) {
      if (breakOnce('copy', this.name)) throw new Error('disk full');
      fs.copyFileSync(this.path, dest.path, fs.constants.COPYFILE_EXCL);
    }
    open() {
      const fd = fs.openSync(this.path, 'r');
      return {
        readBytes: (n: number) => {
          const buf = new Uint8Array(n);
          fs.readSync(fd, buf, 0, n, 0);
          return buf;
        },
        close: () => fs.closeSync(fd),
      };
    }
  }
  class Directory extends Entry {
    create() {
      fs.mkdirSync(this.path, { recursive: true });
    }
  }
  return {
    File,
    Directory,
    Paths: { document: new Directory(root, 'doc'), cache: new Directory(root, 'cache') },
  };
});
const sqlite = { closes: 0 };
vi.mock('expo-sqlite', () => ({
  openDatabaseAsync: async () => ({
    execAsync: async () => {},
    getFirstAsync: async () => ({ user_version: 99 }),
    closeAsync: async () => void sqlite.closes++,
  }),
}));
const asyncStorage = new Map<string, string>();
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => asyncStorage.get(k) ?? null,
    setItem: async (k: string, v: string) => void asyncStorage.set(k, v),
    removeItem: async (k: string) => void asyncStorage.delete(k),
  },
}));
vi.mock('expo-crypto', () => ({}));

const { expoIO, recoverInterruptedRestore } = await import('./expoIO');
const { closeDbAndHold, getDb } = await import('@/db/client');
const { KeptBackupError } = await import('./keptBackup');
const { takeUnfinishedRestoreNotice } = await import('./restoreNotice');
const { MIGRATIONS } = await import('@/db/migrations');

const DOC = path.join(root, 'doc');
const STAGING = path.join(root, 'cache', 'restore');
const BACKUP = path.join(DOC, 'restore-backup');
const LATEST = MIGRATIONS[MIGRATIONS.length - 1].version;

function databaseBytes(version: number, marker: string): Buffer {
  const bytes = Buffer.alloc(100);
  bytes.write('SQLite format 3\0');
  bytes.writeUInt32BE(version, 60);
  return Buffer.concat([bytes, Buffer.from(marker)]);
}

function put(base: string, file: string, body: Buffer | string) {
  fs.mkdirSync(path.dirname(path.join(base, file)), { recursive: true });
  fs.writeFileSync(path.join(base, file), body);
}

const read = (file: string) => fs.readFileSync(path.join(DOC, file)).toString('latin1');
const has = (file: string) => fs.existsSync(path.join(DOC, file));

function stageNewData() {
  put(STAGING, 'hevier.db', databaseBytes(LATEST, 'new'));
  put(STAGING, 'media/a.jpg', 'photo-a');
}

function expectOldDataIntact() {
  expect(read('SQLite/hevier.db')).toContain('old');
  expect(read('SQLite/hevier.db-wal')).toBe('old-wal');
  expect(read('media/old.jpg')).toBe('old-photo');
  expect(has('media/a.jpg')).toBe(false);
  expect(has('restore-backup')).toBe(false);
}

beforeEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
  asyncStorage.clear();
  Object.assign(failing, { copy: '', moveAside: '', moveBack: '', deleteBackup: '', stuck: '' });
  put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'old'));
  put(DOC, 'SQLite/hevier.db-wal', 'old-wal');
  put(DOC, 'media/old.jpg', 'old-photo');
});

describe('expoIO.replaceAll', () => {
  it('a staged file that never arrived leaves the phone as it was', async () => {
    put(STAGING, 'hevier.db', databaseBytes(LATEST, 'new'));
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow();
    expectOldDataIntact();
  });

  it.each([
    ['not a database', 'not a database'],
    ['a newer app', databaseBytes(LATEST + 1, 'new')],
  ])('a download from %s leaves the phone as it was', async (_name, body) => {
    put(STAGING, 'hevier.db', body);
    await expect(expoIO.replaceAll(['hevier.db'])).rejects.toThrow();
    expectOldDataIntact();
  });

  it('a copy that fails half way puts the old data back', async () => {
    stageNewData();
    failing.copy = 'a.jpg';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('disk full');
    expectOldDataIntact();
  });

  it.each(['hevier.db', 'media'])('setting %s aside fails: what was not moved is not deleted', async (name) => {
    stageNewData();
    failing.moveAside = name;
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('cannot move aside');
    expectOldDataIntact();
  });

  it('a file that cannot be put back keeps the backup and says so', async () => {
    stageNewData();
    failing.copy = 'a.jpg';
    failing.moveBack = 'hevier.db';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toBeInstanceOf(KeptBackupError);
    expect(fs.readFileSync(path.join(BACKUP, 'hevier.db')).toString('latin1')).toContain('old');
    expect(recoverInterruptedRestore()).toBe(true);
    expectOldDataIntact();
  });

  it('a backup left by a killed restore is put back, not deleted', async () => {
    fs.rmSync(path.join(DOC, 'SQLite'), { recursive: true });
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    stageNewData();
    failing.copy = 'a.jpg';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('disk full');
    expect(read('SQLite/hevier.db')).toContain('old-user-data');
  });

  it('a delete of the backup that fails after the swap is not a failed restore', async () => {
    stageNewData();
    failing.deleteBackup = 'restore-trash';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).resolves.toBeUndefined();
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('restore-backup')).toBe(false);
    expect(recoverInterruptedRestore()).toBe(true);
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('restore-trash')).toBe(false);
  });

  it('a stale backup that cannot be put back stops the next restore before it touches anything', async () => {
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    put(BACKUP, 'SET-ASIDE', '');
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'half-new'));
    stageNewData();
    failing.moveBack = 'hevier.db';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toBeInstanceOf(KeptBackupError);
    expect(fs.readFileSync(path.join(BACKUP, 'hevier.db')).toString('latin1')).toContain('old-user-data');
    expect(has('media/a.jpg')).toBe(false);
    expect(has('SQLite/hevier.db')).toBe(false);
  });

  it('a trash that cannot be deleted while the old data is put back does not hide that it is back', async () => {
    stageNewData();
    failing.copy = 'a.jpg';
    failing.deleteBackup = 'restore-trash';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('disk full');
    expectOldDataIntact();
  });

  it('a restore-trash that can never be deleted does not block the app or fail the restore', async () => {
    put(DOC, 'restore-trash/leftover', 'x');
    failing.stuck = 'restore-trash';
    expect(recoverInterruptedRestore()).toBe(true);
    stageNewData();
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).resolves.toBeUndefined();
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('restore-backup')).toBe(false);
    expect(recoverInterruptedRestore()).toBe(true);
    expect(read('SQLite/hevier.db')).toContain('new');
  });

  it('an original with no photo folder does not end up with the new one after a rollback', async () => {
    fs.rmSync(path.join(DOC, 'media'), { recursive: true });
    stageNewData();
    failing.copy = 'a.jpg';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('disk full');
    expect(has('media')).toBe(false);
    expect(read('SQLite/hevier.db')).toContain('old');
  });

  it('what an interrupted restore left does not stop the next one', async () => {
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    put(BACKUP, 'SET-ASIDE', '');
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'half-new'));
    fs.rmSync(path.join(DOC, 'SQLite/hevier.db-wal'));
    stageNewData();
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).resolves.toBeUndefined();
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('restore-backup')).toBe(false);
  });

  it('swaps in the new data and drops the old', async () => {
    stageNewData();
    await expoIO.replaceAll(['hevier.db', 'media/a.jpg']);
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('SQLite/hevier.db-wal')).toBe(false);
    expect(fs.readdirSync(path.join(DOC, 'media'))).toEqual(['a.jpg']);
    expect(has('restore-backup')).toBe(false);
  });
});

describe('recoverInterruptedRestore', () => {
  it('a restore killed while the new data moved in is rolled back', () => {
    fs.rmSync(path.join(DOC, 'media'), { recursive: true });
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'half-new'));
    put(DOC, 'media/a.jpg', 'photo-a');
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old'));
    put(BACKUP, 'hevier.db-wal', 'old-wal');
    put(BACKUP, 'media/old.jpg', 'old-photo');
    put(BACKUP, 'SET-ASIDE', '');
    expect(recoverInterruptedRestore()).toBe(true);
    expectOldDataIntact();
  });

  it('a restore killed while the old data was set aside keeps what was not moved', () => {
    fs.rmSync(path.join(DOC, 'SQLite/hevier.db'));
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old'));
    expect(recoverInterruptedRestore()).toBe(true);
    expectOldDataIntact();
  });

  it('a finished restore is not rolled back', () => {
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'new'));
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old'));
    put(BACKUP, 'SET-ASIDE', '');
    put(BACKUP, 'COMMITTED', '');
    expect(recoverInterruptedRestore()).toBe(true);
    expect(read('SQLite/hevier.db')).toContain('new');
    expect(has('restore-backup')).toBe(false);
  });
});

describe('the database around a restore', () => {
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const answers = (promise: Promise<unknown>) => Promise.race([promise.then(() => 'answered', () => 'rejected'), sleep(300).then(() => 'stuck')]);

  async function closedDb() {
    (await closeDbAndHold())();
  }

  it('is closed for the swap, and opens again when the swap fails', async () => {
    await getDb();
    const closed = sqlite.closes;
    stageNewData();
    failing.copy = 'a.jpg';
    await expect(expoIO.replaceAll(['hevier.db', 'media/a.jpg'])).rejects.toThrow('disk full');
    expect(sqlite.closes).toBe(closed + 1);
    expect(await answers(getDb())).toBe('answered');
  });

  it('opens only after a restore killed halfway is put back', async () => {
    await closedDb();
    fs.rmSync(path.join(DOC, 'SQLite'), { recursive: true });
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    await getDb();
    expect(read('SQLite/hevier.db')).toContain('old-user-data');
  });

  it('a restore killed after all the new data moved in, before COMMITTED, is undone and the user is told once', async () => {
    await closedDb();
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    put(BACKUP, 'SET-ASIDE', '');
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'complete-new'));
    put(DOC, 'media/a.jpg', 'photo-a');
    await getDb();
    expect(read('SQLite/hevier.db')).toContain('old-user-data');
    expect(has('media/a.jpg')).toBe(false);
    expect(await takeUnfinishedRestoreNotice()).toBe(true);
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
  });

  it('a finished restore, or a start with nothing to undo, leaves no notice', async () => {
    await closedDb();
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    put(BACKUP, 'SET-ASIDE', '');
    put(BACKUP, 'COMMITTED', '');
    put(DOC, 'SQLite/hevier.db', databaseBytes(LATEST, 'complete-new'));
    await getDb();
    expect(read('SQLite/hevier.db')).toContain('complete-new');
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
    await closedDb();
    await getDb();
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
  });

  it('a recovery that cannot put everything back tells nothing yet, the note comes with the start that does', async () => {
    await closedDb();
    fs.rmSync(path.join(DOC, 'SQLite'), { recursive: true });
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    failing.moveBack = 'hevier.db';
    expect(await answers(getDb())).toBe('rejected');
    expect(await takeUnfinishedRestoreNotice()).toBe(false);
    expect(await answers(getDb())).toBe('answered');
    expect(await takeUnfinishedRestoreNotice()).toBe(true);
  });

  it('stays shut while the old data cannot be put back, so nothing new lands on top of it', async () => {
    await closedDb();
    fs.rmSync(path.join(DOC, 'SQLite'), { recursive: true });
    put(BACKUP, 'hevier.db', databaseBytes(LATEST, 'old-user-data'));
    failing.moveBack = 'hevier.db';
    expect(await answers(getDb())).toBe('rejected');
    expect(has('SQLite/hevier.db')).toBe(false);
    expect(await answers(getDb())).toBe('answered');
    expect(read('SQLite/hevier.db')).toContain('old-user-data');
  });
});
