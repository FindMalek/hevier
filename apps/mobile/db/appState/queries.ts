import { marks } from '@/db/placeholders';

// The SQL of the app_state table (small saved values, one row per key; the
// keys are STORAGE_KEYS in constants/storage.ts).

export const SELECT_APP_STATE_VALUE = 'SELECT value FROM app_state WHERE key = ?';

export const UPSERT_APP_STATE_VALUE = 'INSERT OR REPLACE INTO app_state (key, value) VALUES (?, ?)';

// Fails when the key is already there (a value written once, e.g. the sync device id).
export const INSERT_APP_STATE_VALUE = 'INSERT INTO app_state (key, value) VALUES (?, ?)';

// Several keys in one statement: one ? per key.
export function selectAppStateValuesIn(count: number): string {
  return `SELECT key, value FROM app_state WHERE key IN (${marks(count)})`;
}

export function deleteAppStateKeysIn(count: number): string {
  return `DELETE FROM app_state WHERE key IN (${marks(count)})`;
}
