import { type SQLiteDatabase } from 'expo-sqlite';
import { migrateDb } from './schema';

export const DB_NAME = 'moodcounter.db';

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await migrateDb(db);
}
