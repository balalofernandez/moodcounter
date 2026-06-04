import { type SQLiteDatabase } from 'expo-sqlite';
import { type DayKey } from '@/lib/dates';

export interface MoodEntry {
  id: number;
  profile_id: number;
  date: DayKey;
  mood: number;
  note: string | null;
  updated_at: string;
}

export async function upsertEntry(
  db: SQLiteDatabase,
  profileId: number,
  date: DayKey,
  mood: number,
  note: string | null,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO mood_entries (profile_id, date, mood, note, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(profile_id, date) DO UPDATE SET
       mood = excluded.mood, note = excluded.note, updated_at = datetime('now')`,
    profileId,
    date,
    mood,
    note,
  );
}

export async function getEntry(
  db: SQLiteDatabase,
  profileId: number,
  date: DayKey,
): Promise<MoodEntry | null> {
  return db.getFirstAsync<MoodEntry>(
    'SELECT * FROM mood_entries WHERE profile_id = ? AND date = ?',
    profileId,
    date,
  );
}

export async function getEntriesInRange(
  db: SQLiteDatabase,
  profileId: number,
  start: DayKey,
  end: DayKey,
): Promise<MoodEntry[]> {
  return db.getAllAsync<MoodEntry>(
    `SELECT * FROM mood_entries
     WHERE profile_id = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    profileId,
    start,
    end,
  );
}

export async function deleteEntry(
  db: SQLiteDatabase,
  profileId: number,
  date: DayKey,
): Promise<void> {
  await db.runAsync(
    'DELETE FROM mood_entries WHERE profile_id = ? AND date = ?',
    profileId,
    date,
  );
}
