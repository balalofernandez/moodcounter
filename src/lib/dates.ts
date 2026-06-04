import { addDays, format, parseISO } from 'date-fns';

/** Local-day key in 'yyyy-MM-dd' format. */
export type DayKey = string;

export function toDayKey(d: Date): DayKey {
  return format(d, 'yyyy-MM-dd');
}

export function todayKey(): DayKey {
  return toDayKey(new Date());
}

export function fromDayKey(key: DayKey): Date {
  return parseISO(key);
}

export function addDaysToKey(key: DayKey, days: number): DayKey {
  return toDayKey(addDays(fromDayKey(key), days));
}

export function enumerateDays(start: DayKey, end: DayKey): DayKey[] {
  const out: DayKey[] = [];
  let d = fromDayKey(start);
  const endDate = fromDayKey(end);
  while (d <= endDate) {
    out.push(toDayKey(d));
    d = addDays(d, 1);
  }
  return out;
}

export function shortDate(key: DayKey): string {
  return format(fromDayKey(key), 'd MMM');
}

export function longDate(key: DayKey): string {
  return format(fromDayKey(key), 'EEE, d MMM yyyy');
}
