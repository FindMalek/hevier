import { KEY_HEADER } from '@hevier/shared/sync-protocol';
import { fetchStatus } from './client';
import { baseUrl } from './pairing';
import type { Pairing, SyncFailure, SyncIO } from '@/types/sync';

// Restore from PC: the PC's copy replaces everything on this phone. Every
// file is downloaded and checked first; any failure leaves the phone as it was.
export async function restoreFromPc(io: SyncIO, pairing: Pairing): Promise<{ ok: true } | SyncFailure> {
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
  await io.cleanup();
  return { ok: true };
}
