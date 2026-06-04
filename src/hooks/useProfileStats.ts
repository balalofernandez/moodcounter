import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { getEntriesInRange, type MoodEntry } from '@/db/entries';
import { getProfile, type Profile } from '@/db/profiles';
import {
  buildDailySeries,
  getDistribution,
  getRangeSummary,
  getStreak,
  movingAverageSeries,
  type MovingAveragePoint,
  type RangeSummary,
} from '@/db/stats';
import { rangeBounds, type RangeKey } from '@/lib/ranges';
import { useRefreshOnFocus } from './useRefreshOnFocus';

export interface ProfileStats {
  profile: Profile | null;
  entries: MoodEntry[];
  summary: RangeSummary;
  distribution: number[];
  movingAvg: MovingAveragePoint[];
  streak: number;
}

const EMPTY: ProfileStats = {
  profile: null,
  entries: [],
  summary: { avgMood: null, best: null, worst: null, count: 0 },
  distribution: [],
  movingAvg: [],
  streak: 0,
};

export function useProfileStats(profileId: number, range: RangeKey) {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<ProfileStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let cancelled = false;
    (async () => {
      const { start, end } = rangeBounds(range);
      const [profile, entries, summary, distribution, streak] = await Promise.all([
        getProfile(db, profileId),
        getEntriesInRange(db, profileId, start, end),
        getRangeSummary(db, profileId, start, end),
        getDistribution(db, profileId, start, end),
        getStreak(db, profileId),
      ]);
      const daily = buildDailySeries(entries, start, end);
      const movingAvg = movingAverageSeries(daily, 7);
      if (!cancelled) {
        setStats({ profile, entries, summary, distribution, movingAvg, streak });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db, profileId, range]);

  useRefreshOnFocus(refresh);

  return { ...stats, loading, refresh };
}
