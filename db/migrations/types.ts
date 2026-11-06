// The migration runner (db/migrations/index.ts).

export interface Migration {
  version: number;
  sql: string;
}

// Minimal shape both expo-sqlite's SQLiteDatabase and our sql.js test
// wrapper satisfy, so the runner works in both the app and tests/scripts.
export interface MigratableDb {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
}
