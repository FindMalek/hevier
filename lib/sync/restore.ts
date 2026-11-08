import { KEY_HEADER } from '@/shared/sync-protocol';
import { fetchStatus } from './client';
import { withSyncLock } from './lock';
import { baseUrl } from './pairing';
import { adoptDeviceId } from './deviceId';
import type { Pairing, SyncFailure, SyncIO } from '@/types/sync';

// Restore from PC: the PC's copy replaces everything on this phone. Every
// file is downloaded and checked first; any failure leaves the phone as it was.
// The phone then takes the copy's device id, so its next syncs replace that copy.
export function restoreFromPc(io: SyncIO, pairing: Pairing): Promise<{ ok: true } | SyncFailure> {
  return withSyncLock(async () => {
    try {
      return await restore(io, pairing);
    } catch (e) {
      console.warn('[sync] restore failed', e);
      return { ok: false, reason: 'error' };
    }
  });
}

async function restore(io: SyncIO, pairing: Pairing): Promise<{ ok: true } | SyncFailure> {
  const status = await fetchStatus(pairing);
  if ('ok' in status) return status;
  if (!status.backup) return { ok: false, reason: 'error' };

  const headers = { [KEY_HEADER]: pairing.key };
  const files = status.backup.files;
  await io.cleanup(); // an old half-done restore
  for (const f of files) {
    const url = `${baseUrl(pairing)}/file?path=${encodeURIComponent(f.path)}`;
    const got = await io.download(url, f.path, headers).catch(() => null);
    if (!got || got.status !== 200 || got.size !== f.size) {
      await io.cleanup();
      return { ok: false, reason: 'error' };
    }
  }
  await io.replaceAll(files.map((f) => f.path));
  // The data is already back: failing to note the copy's id only means the next
  // sync asks once ("another phone"), so it must not turn the restore into an error.
  await adoptDeviceId(status.backup.deviceId).catch((e) => console.warn('[sync] could not keep the restored device id', e));
  await io.cleanup();
  return { ok: true };
}
