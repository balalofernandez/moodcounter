import { type SQLiteDatabase } from 'expo-sqlite';
import { addDaysToKey, enumerateDays, todayKey, type DayKey } from '@/lib/dates';
import { MOOD_MAX, MOOD_MIN } from '@/lib/mood';
import { type MoodEntry } from './entries';

export interface RangeSummary {
  avgMood: number | null;
  best: MoodEntry | null;
  worst: MoodEntry | null;
  count: number;
}

export async function getRangeSummary(
  db: SQLiteDatabase,
  profileId: number,
  start: DayKey,
  end: DayKey,
): Promise<RangeSummary> {
  const agg = await db.getFirstAsync<{ avg_mood: number | null; n: number }>(
    `SELECT AVG(mood) AS avg_mood, COUNT(*) AS n
     FROM mood_entries WHERE profile_id = ? AND date >= ? AND date <= ?`,
    profileId,
    start,
    end,
  );
  if (!agg || agg.n === 0) {
    return { avgMood: null, best: null, worst: null, count: 0 };
  }
  const best = await db.getFirstAsync<MoodEntry>(
    `SELECT * FROM mood_entries WHERE profile_id = ? AND date >= ? AND date <= ?
     ORDER BY mood DESC, date DESC LIMIT 1`,
    profileId,
    start,
    end,
  );
  const worst = await db.getFirstAsync<MoodEntry>(
    `SELECT * FROM mood_entries WHERE profile_id = ? AND date >= ? AND date <= ?
     ORDER BY mood ASC, date DESC LIMIT 1`,
    profileId,
    start,
    end,
  );
  return { avgMood: agg.avg_mood, best, worst, count: agg.n };
}

/** Counts per mood value 1..10 (index 0 = mood 1). */
export async function getDistribution(
  db: SQLiteDatabase,
  profileId: number,
  start: DayKey,
  end: DayKey,
): Promise<number[]> {
  const rows = await db.getAllAsync<{ bucket: number; n: number }>(
    `SELECT mood AS bucket, COUNT(*) AS n FROM mood_entries
     WHERE profile_id = ? AND date >= ? AND date <= ?
     GROUP BY mood ORDER BY mood`,
    profileId,
    start,
    end,
  );
  const counts = new Array(MOOD_MAX - MOOD_MIN + 1).fill(0);
  for (const row of rows) counts[row.bucket - MOOD_MIN] = row.n;
  return counts;
}

/** Consecutive logged days ending today (or yesterday if today is not yet logged). */
export async function getStreak(db: SQLiteDatabase, profileId: number): Promise<number> {
  const rows = await db.getAllAsync<{ date: DayKey }>(
    'SELECT date FROM mood_entries WHERE profile_id = ? ORDER BY date DESC LIMIT 400',
    profileId,
  );
  if (rows.length === 0) return 0;
  const logged = new Set(rows.map((r) => r.date));
  let day = todayKey();
  if (!logged.has(day)) day = addDaysToKey(day, -1);
  let streak = 0;
  while (logged.has(day)) {
    streak += 1;
    day = addDaysToKey(day, -1);
  }
  return streak;
}

export interface DailyPoint {
  date: DayKey;
  mood: number | null;
}

/** Gap-filled series: one point per calendar day in [start, end], null when not logged. */
export function buildDailySeries(entries: MoodEntry[], start: DayKey, end: DayKey): DailyPoint[] {
  const byDate = new Map(entries.map((e) => [e.date, e.mood]));
  return enumerateDays(start, end).map((date) => ({ date, mood: byDate.get(date) ?? null }));
}

export interface MovingAveragePoint {
  date: DayKey;
  value: number;
}

/**
 * Trailing moving average over logged values within the window
 * (missing days ignored; days with no logged values in the window are skipped).
 */
export function movingAverageSeries(daily: DailyPoint[], window = 7): MovingAveragePoint[] {
  const out: MovingAveragePoint[] = [];
  for (let i = 0; i < daily.length; i++) {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - window + 1); j <= i; j++) {
      const mood = daily[j].mood;
      if (mood != null) {
        sum += mood;
        n += 1;
      }
    }
    if (n > 0) out.push({ date: daily[i].date, value: sum / n });
  }
  return out;
}

export interface ProfileComparison {
  profile_id: number;
  avg_mood: number;
  n: number;
}

export async function getProfilesComparison(
  db: SQLiteDatabase,
  start: DayKey,
  end: DayKey,
): Promise<ProfileComparison[]> {
  return db.getAllAsync<ProfileComparison>(
    `SELECT profile_id, AVG(mood) AS avg_mood, COUNT(*) AS n
     FROM mood_entries WHERE date >= ? AND date <= ?
     GROUP BY profile_id`,
    start,
    end,
  );
}

export async function getTotalCount(db: SQLiteDatabase, profileId: number): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM mood_entries WHERE profile_id = ?',
    profileId,
  );
  return row?.n ?? 0;
}
