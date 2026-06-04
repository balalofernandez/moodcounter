import { type SQLiteDatabase } from 'expo-sqlite';

const LATEST_VERSION = 1;

export async function migrateDb(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;
  if (version >= LATEST_VERSION) return;

  if (version === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        color       TEXT    NOT NULL DEFAULT '#4F8EF7',
        emoji       TEXT,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        sort_order  INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS mood_entries (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        profile_id  INTEGER NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        date        TEXT    NOT NULL,
        mood        INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 10),
        note        TEXT,
        updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        UNIQUE (profile_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_entries_profile_date
        ON mood_entries (profile_id, date);
    `);
    version = 1;
  }

  await db.execAsync(`PRAGMA user_version = ${LATEST_VERSION}`);
}
