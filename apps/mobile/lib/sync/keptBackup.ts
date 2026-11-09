// A restore failed and could not put every old file back: the rest is still in
// restore-backup, and the next app start tries again.
export class KeptBackupError extends Error {
  constructor(cause: unknown) {
    super('restore: the old data could not be put back', { cause });
    this.name = 'KeptBackupError';
  }
}
