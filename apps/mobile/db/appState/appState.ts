import type { SQLiteDatabase } from 'expo-sqlite';
import { getDb } from '@/db/client';
import {
  deleteAppStateKeysIn,
  INSERT_APP_STATE_VALUE,
  SELECT_APP_STATE_VALUE,
  selectAppStateValuesIn,
  UPSERT_APP_STATE_VALUE,
} from './queries';
import type { AppStateKeyRow, AppStateRow } from './rows';

// The app_state table: small saved values, one row per key (STORAGE_KEYS).
// Some keys hold JSON (getJson / setJson), others a plain string (getString /
// setString): each key keeps the format it always had, so saved data still loads.
// Every helper takes an optional db handle for a caller already holding one
// (inside runInTransaction); without it, the shared connection is used.

export async function getString(key: string, db?: SQLiteDatabase): Promise<string | null> {
  const conn = db ?? (await getDb());
  const row = await conn.getFirstAsync<AppStateRow>(SELECT_APP_STATE_VALUE, [key]);
  return row ? row.value : null;
}

export async function setString(key: string, value: string, db?: SQLiteDatabase): Promise<void> {
  const conn = db ?? (await getDb());
  await conn.runAsync(UPSERT_APP_STATE_VALUE, [key, value]);
}

// Throws when the key is already saved.
export async function insertString(key: string, value: string, db?: SQLiteDatabase): Promise<void> {
  const conn = db ?? (await getDb());
  await conn.runAsync(INSERT_APP_STATE_VALUE, [key, value]);
}

// Several plain values in one read; a key with no row is left out.
export async function getStrings(keys: string[], db?: SQLiteDatabase): Promise<Map<string, string>> {
  const conn = db ?? (await getDb());
  const rows = await conn.getAllAsync<AppStateKeyRow>(selectAppStateValuesIn(keys.length), keys);
  return new Map(rows.map((r) => [r.key, r.value]));
}

// null when the key has no row.
export async function getJson<T>(key: string, db?: SQLiteDatabase): Promise<T | null> {
  const value = await getString(key, db);
  return value === null ? null : (JSON.parse(value) as T);
}

export async function setJson(key: string, value: unknown, db?: SQLiteDatabase): Promise<void> {
  await setString(key, JSON.stringify(value), db);
}

// One key or several, in one statement.
export async function remove(keys: string | string[], db?: SQLiteDatabase): Promise<void> {
  const list = typeof keys === 'string' ? [keys] : keys;
  const conn = db ?? (await getDb());
  await conn.runAsync(deleteAppStateKeysIn(list.length), list);
}
