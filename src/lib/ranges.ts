import { addDays, startOfYear, subMonths, subYears } from 'date-fns';
import { DayKey, toDayKey } from './dates';

export type RangeKey = '1W' | '1M' | '3M' | '12M' | 'YTD';

export const RANGE_KEYS: RangeKey[] = ['1W', '1M', '3M', '12M', 'YTD'];

export interface RangeBounds {
  start: DayKey;
  end: DayKey;
}

export function rangeBounds(key: RangeKey, today: Date = new Date()): RangeBounds {
  const end = toDayKey(today);
  switch (key) {
    case '1W':
      return { start: toDayKey(addDays(today, -6)), end };
    case '1M':
      return { start: toDayKey(addDays(subMonths(today, 1), 1)), end };
    case '3M':
      return { start: toDayKey(addDays(subMonths(today, 3), 1)), end };
    case '12M':
      return { start: toDayKey(addDays(subYears(today, 1), 1)), end };
    case 'YTD':
      return { start: toDayKey(startOfYear(today)), end };
  }
}
