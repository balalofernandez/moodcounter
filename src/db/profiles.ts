import { type SQLiteDatabase } from 'expo-sqlite';

export interface Profile {
  id: number;
  name: string;
  color: string;
  emoji: string | null;
  created_at: string;
  sort_order: number;
}

export async function listProfiles(db: SQLiteDatabase): Promise<Profile[]> {
  return db.getAllAsync<Profile>('SELECT * FROM profiles ORDER BY sort_order ASC, id ASC');
}

export async function getProfile(db: SQLiteDatabase, id: number): Promise<Profile | null> {
  return db.getFirstAsync<Profile>('SELECT * FROM profiles WHERE id = ?', id);
}

export async function createProfile(
  db: SQLiteDatabase,
  name: string,
  color: string,
  emoji: string | null,
): Promise<number> {
  const max = await db.getFirstAsync<{ m: number | null }>(
    'SELECT MAX(sort_order) AS m FROM profiles',
  );
  const result = await db.runAsync(
    'INSERT INTO profiles (name, color, emoji, sort_order) VALUES (?, ?, ?, ?)',
    name,
    color,
    emoji,
    (max?.m ?? 0) + 1,
  );
  return result.lastInsertRowId;
}

export async function updateProfile(
  db: SQLiteDatabase,
  id: number,
  fields: { name: string; color: string; emoji: string | null },
): Promise<void> {
  await db.runAsync(
    'UPDATE profiles SET name = ?, color = ?, emoji = ? WHERE id = ?',
    fields.name,
    fields.color,
    fields.emoji,
    id,
  );
}

export async function deleteProfile(db: SQLiteDatabase, id: number): Promise<void> {
  // ON DELETE CASCADE removes the profile's mood entries.
  await db.runAsync('DELETE FROM profiles WHERE id = ?', id);
}
