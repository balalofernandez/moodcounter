import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { getEntriesInRange, getEntry, type MoodEntry } from '@/db/entries';
import {
  createProfile,
  deleteProfile,
  listProfiles,
  updateProfile,
  type Profile,
} from '@/db/profiles';
import { getTotalCount } from '@/db/stats';
import { addDaysToKey, todayKey, type DayKey } from '@/lib/dates';
import { useRefreshOnFocus } from './useRefreshOnFocus';

export interface ProfileOverview {
  profile: Profile;
  todayEntry: MoodEntry | null;
  avg30: number | null;
  totalCount: number;
  spark: MoodEntry[]; // last 14 days, logged days only
}

export function useProfiles() {
  const db = useSQLiteContext();
  const [overviews, setOverviews] = useState<ProfileOverview[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let cancelled = false;
    (async () => {
      const profiles = await listProfiles(db);
      const today = todayKey();
      const result: ProfileOverview[] = [];
      for (const profile of profiles) {
        const [todayEntry, totalCount, last30, spark] = await Promise.all([
          getEntry(db, profile.id, today),
          getTotalCount(db, profile.id),
          getEntriesInRange(db, profile.id, addDaysToKey(today, -29), today),
          getEntriesInRange(db, profile.id, addDaysToKey(today, -13), today),
        ]);
        const avg30 =
          last30.length > 0
            ? last30.reduce((sum, e) => sum + e.mood, 0) / last30.length
            : null;
        result.push({ profile, todayEntry, avg30, totalCount, spark });
      }
      if (!cancelled) {
        setOverviews(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  useRefreshOnFocus(refresh);

  const addProfile = useCallback(
    async (name: string, color: string, emoji: string | null) => {
      await createProfile(db, name, color, emoji);
      refresh();
    },
    [db, refresh],
  );

  const editProfile = useCallback(
    async (id: number, fields: { name: string; color: string; emoji: string | null }) => {
      await updateProfile(db, id, fields);
      refresh();
    },
    [db, refresh],
  );

  const removeProfile = useCallback(
    async (id: number) => {
      await deleteProfile(db, id);
      refresh();
    },
    [db, refresh],
  );

  return { overviews, loading, refresh, addProfile, editProfile, removeProfile };
}

export type { DayKey };
