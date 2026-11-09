import { SQLITE_HEADER } from '@/constants/storage';

// True when the bytes start a SQLite file whose schema this app knows. A
// restore checks this before it touches anything on the phone.
export function isRestorableDatabase(header: Uint8Array, latestVersion: number): boolean {
  if (header.length < SQLITE_HEADER.length) return false;
  const magic = String.fromCharCode(...header.subarray(0, SQLITE_HEADER.magic.length));
  if (magic !== SQLITE_HEADER.magic) return false;
  const version = new DataView(header.buffer, header.byteOffset, header.byteLength).getUint32(SQLITE_HEADER.userVersionOffset);
  return version <= latestVersion;
}
