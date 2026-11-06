// The database's schema version: which migrations have run.
export const SELECT_USER_VERSION = 'PRAGMA user_version';

export function setUserVersion(version: number): string {
  return `PRAGMA user_version = ${version}`;
}
