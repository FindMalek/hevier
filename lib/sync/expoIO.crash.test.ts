import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hevier-crash-'));
afterAll(() => fs.rmSync(root, { recursive: true, force: true }));
// Every filesystem step is a numbered operation. A kill at step K freezes the
// disk and makes every later step throw, so the in-process rollback cannot help;
// the next start (recoverInterruptedRestore) must leave either all the old data
// or all the new. The order a recursive delete removes its children in is not
// known on Android, so each order is tried.
const sim = { killAt: Infinity, failAt: Infinity, ops: 0, dead: false, order: 'alpha' as string, log: [] as string[] };
class Kill extends Error {}
function op(desc: string) {
  if (sim.dead) throw new Kill('dead');
  sim.ops += 1;
  if (sim.ops === sim.failAt) {
    sim.log.push('FAIL before ' + desc);
    throw new Error('io error before ' + desc);
  }
  if (sim.ops === sim.killAt) {
    sim.dead = true;
    sim.log.push('KILL before ' + desc);
    throw new Kill('killed before ' + desc);
  }
  sim.log.push(desc);
}

vi.mock('expo-file-system', () => {
  type Part = string | { path: string };
  const join = (parts: Part[]) => path.join(...parts.map((p) => (typeof p === 'string' ? p : p.path)));
  function rmTree(p: string) {
    const st = fs.lstatSync(p);
    if (st.isDirectory()) {
      let names = fs.readdirSync(p);
      const rank = (n: string) => {
        if (sim.order === 'alpha') return n; // COMMITTED, SET-ASIDE, then lowercase names
        if (sim.order === 'ralpha') return String.fromCharCode(...[...n].map((c) => 255 - c.charCodeAt(0)));
        if (sim.order === 'committed-first') return n === 'COMMITTED' ? '0' : n === 'SET-ASIDE' ? '9' : '5' + n;
        return n === 'SET-ASIDE' ? '0' : n === 'COMMITTED' ? '9' : '5' + n; // setaside-first: safest
      };
      names = names.sort((a, b) => (rank(a) < rank(b) ? -1 : 1));
      for (const n of names) rmTree(path.join(p, n));
      op('rmdir ' + p);
      fs.rmdirSync(p);
    } else {
      op('unlink ' + p);
      fs.unlinkSync(p);
    }
  }
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
      rmTree(this.path);
    }
    moveSync(dest: Entry) {
      const into = dest instanceof Directory && dest.exists;
      const target = into ? path.join(dest.path, this.name) : dest.path;
      if (!fs.existsSync(path.dirname(target))) throw new Error('destination does not exist');
      if (fs.existsSync(target)) throw new Error('destination already exists');
      op('move ' + this.path + ' -> ' + target);
      fs.renameSync(this.path, target);
      this.path = target;
    }
  }
  class File extends Entry {
    create() {
      op('create ' + this.path);
      fs.writeFileSync(this.path, '', { flag: 'wx' });
    }
    copySync(dest: File) {
      if (!fs.existsSync(path.dirname(dest.path))) throw new Error('destination does not exist');
      if (fs.existsSync(dest.path)) throw new Error('destination already exists');
      const body = fs.readFileSync(this.path);
      op('copy-partial ' + dest.path);
      fs.writeFileSync(dest.path, body.subarray(0, Math.max(1, body.length >> 1)));
      op('copy-finish ' + dest.path);
      fs.writeFileSync(dest.path, body);
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
      if (!fs.existsSync(this.path)) op('mkdir ' + this.path);
      fs.mkdirSync(this.path, { recursive: true });
    }
  }
  return { File, Directory, Paths: { document: new Directory(root, 'doc'), cache: new Directory(root, 'cache') } };
});
vi.mock('expo-sqlite', () => ({}));
vi.mock('expo-crypto', () => ({}));

vi.spyOn(console, 'warn').mockImplementation(() => {});
const { expoIO, recoverInterruptedRestore } = await import('./expoIO');
const { MIGRATIONS } = await import('@/db/migrations');
const DOC = path.join(root, 'doc');
const STAGING = path.join(root, 'cache', 'restore');
const LATEST = MIGRATIONS[MIGRATIONS.length - 1].version;

function dbBytes(marker: string): Buffer {
  const bytes = Buffer.alloc(100);
  bytes.write('SQLite format 3\0');
  bytes.writeUInt32BE(LATEST, 60);
  return Buffer.concat([bytes, Buffer.from(marker)]);
}
function put(base: string, file: string, body: Buffer | string) {
  fs.mkdirSync(path.dirname(path.join(base, file)), { recursive: true });
  fs.writeFileSync(path.join(base, file), body);
}
function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p)] = fs.readFileSync(p).toString('latin1');
    }
  };
  walk(dir);
  return out;
}

const SCENARIOS: Record<string, () => void> = {
  full: () => {
    put(DOC, 'SQLite/hevier.db', dbBytes('old'));
    put(DOC, 'SQLite/hevier.db-wal', 'old-wal');
    put(DOC, 'SQLite/hevier.db-shm', 'old-shm');
    put(DOC, 'media/old1.jpg', 'p1');
    put(DOC, 'media/old2.jpg', 'p2');
    put(DOC, 'profile/me.jpg', 'me');
  },
  dbOnly: () => {
    put(DOC, 'SQLite/hevier.db', dbBytes('old'));
  },
};

function stageNew() {
  put(STAGING, 'hevier.db', dbBytes('new'));
  put(STAGING, 'media/a.jpg', 'photo-a');
  put(STAGING, 'profile/new.jpg', 'newme');
}
const NEW_PATHS = ['hevier.db', 'media/a.jpg', 'profile/new.jpg'];

async function runOnce(scenario: string, killAt: number, order: string, failAt = Infinity, killInRecovery = Infinity) {
  fs.rmSync(root, { recursive: true, force: true });
  SCENARIOS[scenario]();
  const original = snapshot(DOC);
  stageNew();
  Object.assign(sim, { killAt, failAt, ops: 0, dead: false, order, log: [] });
  let outcome = 'ok';
  try {
    await expoIO.replaceAll(NEW_PATHS);
  } catch (e) {
    outcome = (e as Error).name + ':' + (e as Error).message;
  }
  const killed = sim.dead;
  sim.dead = false;
  sim.killAt = Infinity;
  sim.failAt = Infinity;
  const committed = sim.log.some((l) => l.startsWith('create') && l.endsWith('COMMITTED'));
  const restoreOps = sim.ops;
  Object.assign(sim, { ops: 0, killAt: killInRecovery });
  recoverInterruptedRestore(); // the next start; killInRecovery kills this one too
  const recoveryOps = sim.ops;
  sim.dead = false;
  sim.killAt = Infinity;
  recoverInterruptedRestore();
  const afterRecover = snapshot(DOC);
  recoverInterruptedRestore();
  const afterRecover2 = snapshot(DOC);
  return { original, afterRecover, afterRecover2, killed, committed, outcome, restoreOps, recoveryOps, log: sim.log.slice() };
}

const MIN_OPS = 10;
const NEW_KEYS = ['SQLite/hevier.db', 'media/a.jpg', 'profile/new.jpg'];
const ORDERS = ['alpha', 'ralpha', 'committed-first', 'setaside-first'];
const short = (s: string) => s.replaceAll(root, '');

function check(r: Awaited<ReturnType<typeof runOnce>>, label: string, problems: string[]) {
  const wantNew = r.committed || (!r.killed && r.outcome === 'ok');
  const got = r.afterRecover;
  if (!wantNew) {
    if (JSON.stringify(got) !== JSON.stringify(r.original)) problems.push(`${label}: expected the old data, got ${JSON.stringify(Object.keys(got))}`);
  } else {
    const keys = Object.keys(got).sort();
    const isNew = JSON.stringify(keys) === JSON.stringify([...NEW_KEYS].sort()) && got['SQLite/hevier.db'].includes('new');
    if (!isNew) problems.push(`${label}: expected the new data, got ${JSON.stringify(keys)}`);
  }
  if (JSON.stringify(r.afterRecover2) !== JSON.stringify(r.afterRecover)) problems.push(`${label}: a second recovery changed things`);
}

async function killEverywhere(scenario: string, order: string): Promise<string[]> {
  const problems: string[] = [];
  const clean = await runOnce(scenario, Infinity, order);
  expect(clean.outcome).toBe('ok');
  const total = clean.restoreOps;
  expect(total).toBeGreaterThan(MIN_OPS); // 0 would make every loop below pass without running
  for (let k = 1; k <= total; k++) {
    const r = await runOnce(scenario, k, order);
    check(r, `kill@${k} [${short(r.log[r.log.length - 1])}]`, problems);
  }
  return problems;
}

async function failThenKillInRollback(scenario: string, order: string): Promise<string[]> {
  const problems: string[] = [];
  const total = (await runOnce(scenario, Infinity, order)).restoreOps;
  expect(total).toBeGreaterThan(MIN_OPS);
  for (let f = 1; f <= total; f++) {
    const failed = await runOnce(scenario, Infinity, order, f);
    const rollbackOps = failed.restoreOps;
    check(failed, `fail@${f}`, problems);
    for (let k = f + 1; k <= rollbackOps + 1; k++) {
      const r = await runOnce(scenario, k, order, f);
      check(r, `fail@${f}+kill@${k} [${short(r.log[r.log.length - 1])}]`, problems);
    }
  }
  return problems;
}

// The start-up recovery is killed too, then the start after that must finish the job.
async function killAgainInRecovery(): Promise<string[]> {
  const problems: string[] = [];
  const total = (await runOnce('dbOnly', Infinity, 'alpha')).restoreOps;
  expect(total).toBeGreaterThan(MIN_OPS);
  for (let k = 1; k <= total; k++) {
    const probe = await runOnce('dbOnly', k, 'alpha');
    for (let j = 1; j <= probe.recoveryOps + 1; j++) {
      check(await runOnce('dbOnly', k, 'alpha', Infinity, j), `kill@${k}+recovery kill@${j}`, problems);
    }
  }
  return problems;
}

const SLOW_MS = 30000;

describe('a restore killed or failed at any step', () => {
  for (const order of ORDERS) {
    for (const scenario of Object.keys(SCENARIOS)) {
      it(`killed: ${scenario}, delete order ${order}`, async () => {
        expect(await killEverywhere(scenario, order)).toEqual([]);
      }, SLOW_MS);
    }
    it(`failed, then killed while rolling back: dbOnly, delete order ${order}`, async () => {
      expect(await failThenKillInRollback('dbOnly', order)).toEqual([]);
    }, SLOW_MS);
  }
  it('failed, then killed while rolling back: full', async () => {
    expect(await failThenKillInRollback('full', 'alpha')).toEqual([]);
  }, 60000);
  it('killed, then killed again while the next start puts things right: dbOnly', async () => {
    expect(await killAgainInRecovery()).toEqual([]);
  }, SLOW_MS);
});
