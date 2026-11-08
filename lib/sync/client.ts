import { KEY_HEADER } from '@/shared/sync-protocol';
import type { BeginRequest, BeginResponse, Refusal, StatusResponse } from '@/shared/sync-types';
import { acquireSyncLock } from './lock';
import { baseUrl, getPairing, setLastSynced } from './pairing';
import { SYNC_TIMEOUTS } from '@/constants/motion';
import { SYNC_HOSTS } from '@/constants/storage';
import type { Pairing, SyncFailure, SyncIO, SyncResult } from '@/types/sync';

// Sends a copy of the phone's data to the Hevier Sync window on the PC. Files are reached
// through SyncIO, so this runs in tests against the real PC server.

let lastRefusal: SyncFailure | null = null;
const listeners = new Set<(r: SyncFailure | null) => void>();

function setLastRefusal(r: SyncFailure | null) {
  lastRefusal = r;
  listeners.forEach((l) => l(r));
}

// A refusal from the quiet sync on app open, shown on the Sync screen.
export function getLastRefusal(): SyncFailure | null {
  return lastRefusal;
}

// The Sync screen may already be open when the quiet sync is refused.
export function onRefusalChange(listener: (r: SyncFailure | null) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Sync over the USB cable: the Hevier Sync window maps this phone's port 4873
// to the PC's through the cable (adb reverse, backup-server/usb.ts), so the
// PC answers at the phone's own address. Same key and port as the pairing.

export function overUsb(pairing: Pairing): Pairing {
  return { ...pairing, host: SYNC_HOSTS.usb };
}

// fetch with a time limit; a closed PC program or an unreachable address
// both come back as pcNotFound.
export async function request(url: string, init: RequestInit, timeoutMs?: number): Promise<Response | null> {
  const controller = new AbortController();
  const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

// What the PC holds (Restore from PC shows its date and workout count).
export async function fetchStatus(pairing: Pairing, timeoutMs = SYNC_TIMEOUTS.requestMs): Promise<StatusResponse | SyncFailure> {
  const res = await request(`${baseUrl(pairing)}/status`, { headers: { [KEY_HEADER]: pairing.key } }, timeoutMs);
  if (!res) return { ok: false, reason: 'pcNotFound' };
  if (res.status === 401) return { ok: false, reason: 'wrongKey' };
  if (res.status !== 200) return { ok: false, reason: 'error' };
  return (await res.json()) as StatusResponse;
}

type SyncOptions = { force?: boolean; timeoutMs?: number; pairing?: Pairing | null };

export async function syncNow(io: SyncIO, opts: SyncOptions = {}): Promise<SyncResult> {
  const release = acquireSyncLock();
  if (!release) return { ok: false, reason: 'busy' };
  try {
    return await runSync(io, opts);
  } finally {
    release();
  }
}

async function runSync(io: SyncIO, opts: SyncOptions): Promise<SyncResult> {
  const pairing = opts.pairing !== undefined ? opts.pairing : await getPairing();
  if (!pairing) return { ok: false, reason: 'notPaired' };
  const base = baseUrl(pairing);
  const headers = { [KEY_HEADER]: pairing.key };
  const timeoutMs = opts.timeoutMs ?? SYNC_TIMEOUTS.requestMs;

  // Is the PC there? Asked before the database copy is made, so a closed
  // PC program costs nothing on app open.
  const status = await request(`${base}/status`, { headers }, timeoutMs);
  if (!status) return { ok: false, reason: 'pcNotFound' };
  if (status.status === 401) return { ok: false, reason: 'wrongKey' };
  if (status.status !== 200) return { ok: false, reason: 'error' };

  try {
    const snap = await io.snapshot();
    const at = new Date().toISOString();
    const req: BeginRequest = { ...snap, date: at, force: opts.force };
    const begin = await request(
      `${base}/begin`,
      { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(req) },
      timeoutMs
    );
    if (!begin) return { ok: false, reason: 'pcNotFound' };
    if (begin.status === 409) {
      const refusal = (await begin.json()) as Refusal;
      const failure: SyncFailure = { ok: false, reason: refusal.reason, pc: refusal.pc, phoneWorkouts: snap.workouts };
      setLastRefusal(failure);
      return failure;
    }
    if (begin.status !== 200) return { ok: false, reason: 'error' };

    // Photos and videos can be big: no time limit on the uploads.
    const { need } = (await begin.json()) as BeginResponse;
    for (const p of need) {
      const code = await io.upload(`${base}/file?path=${encodeURIComponent(p)}`, p, headers);
      if (code !== 200) return { ok: false, reason: 'error' };
    }
    const commit = await request(`${base}/commit`, { method: 'POST', headers });
    if (commit?.status !== 200) return { ok: false, reason: commit ? 'error' : 'pcNotFound' };

    await setLastSynced(at);
    setLastRefusal(null);
    return { ok: true, at };
  } catch (e) {
    console.warn('[sync] failed', e);
    return { ok: false, reason: 'error' };
  } finally {
    await io.cleanup();
  }
}

// On app open: send a copy if the PC program is open, otherwise nothing.
// One at a time: coming back to the app while a copy is still going adds
// nothing.
let quietRunning = false;

export async function quietSync(io: SyncIO): Promise<void> {
  if (quietRunning) return;
  quietRunning = true;
  try {
    await syncNow(io, { timeoutMs: SYNC_TIMEOUTS.quietMs });
  } catch {
    // never bothers the user
  } finally {
    quietRunning = false;
  }
}
