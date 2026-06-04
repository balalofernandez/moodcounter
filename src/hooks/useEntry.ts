import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import { deleteEntry, getEntry, upsertEntry, type MoodEntry } from '@/db/entries';
import { type DayKey } from '@/lib/dates';

export function useEntry(profileId: number, date: DayKey) {
  const db = useSQLiteContext();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEntry(db, profileId, date).then((result) => {
      if (!cancelled) {
        setEntry(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, profileId, date]);

  const save = useCallback(
    async (mood: number, note: string | null) => {
      await upsertEntry(db, profileId, date, mood, note);
    },
    [db, profileId, date],
  );

  const remove = useCallback(async () => {
    await deleteEntry(db, profileId, date);
  }, [db, profileId, date]);

  return { entry, loading, save, remove };
}
