import { format, startOfWeek, startOfYear } from 'date-fns';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fromDayKey, toDayKey, todayKey, type DayKey } from '@/lib/dates';
import { MOOD_VALUES, moodColor } from '@/lib/mood';
import { colors } from '@/theme/colors';

const CELL = 16;
const GAP = 3;
const COLUMN = CELL + GAP;

interface Props {
  /** mood value per logged day key */
  moodByDate: Map<DayKey, number>;
  onDayPress: (date: DayKey) => void;
}

interface Week {
  /** 7 day keys Mon..Sun; days outside [Jan 1, today] are null */
  days: (DayKey | null)[];
  monthLabel: string | null;
}

function buildWeeks(): Week[] {
  const today = todayKey();
  const jan1 = toDayKey(startOfYear(fromDayKey(today)));
  // Monday on/before Jan 1
  let cursor = startOfWeek(fromDayKey(jan1), { weekStartsOn: 1 });
  const weeks: Week[] = [];
  let lastMonth = '';
  while (toDayKey(cursor) <= today) {
    const days: (DayKey | null)[] = [];
    let monthLabel: string | null = null;
    for (let i = 0; i < 7; i++) {
      const key = toDayKey(cursor);
      if (key < jan1 || key > today) {
        days.push(null);
      } else {
        days.push(key);
        const month = format(cursor, 'MMM');
        if (month !== lastMonth) {
          lastMonth = month;
          monthLabel = month;
        }
      }
      cursor = new Date(cursor.getTime() + 24 * 3600 * 1000);
    }
    weeks.push({ days, monthLabel });
  }
  return weeks;
}

const DAY_LABELS = ['M', '', 'W', '', 'F', '', 'S'];

export function YearGrid({ moodByDate, onDayPress }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const weeks = buildWeeks();

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={styles.dayLabelColumn}>
          <View style={styles.monthLabelSpacer} />
          {DAY_LABELS.map((label, i) => (
            <View key={i} style={styles.dayLabelCell}>
              <Text style={styles.dayLabelText}>{label}</Text>
            </View>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={w} style={styles.weekColumn}>
            <View style={styles.monthLabelSpacer}>
              {week.monthLabel ? (
                <Text style={styles.monthLabelText}>{week.monthLabel}</Text>
              ) : null}
            </View>
            {week.days.map((day, d) => {
              if (!day) return <View key={d} style={[styles.cell, styles.cellOutside]} />;
              const mood = moodByDate.get(day);
              return (
                <Pressable
                  key={d}
                  hitSlop={2}
                  onPress={() => onDayPress(day)}
                  style={[
                    styles.cell,
                    { backgroundColor: mood != null ? moodColor(mood) : colors.noEntry },
                    day === todayKey() && styles.cellToday,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>
      <View style={styles.legend}>
        <Text style={styles.legendText}>1</Text>
        {MOOD_VALUES.map((v) => (
          <View key={v} style={[styles.legendSwatch, { backgroundColor: moodColor(v) }]} />
        ))}
        <Text style={styles.legendText}>10</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dayLabelColumn: {
    marginRight: 4,
  },
  weekColumn: {
    width: COLUMN,
  },
  monthLabelSpacer: {
    height: 18,
    justifyContent: 'center',
  },
  monthLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayLabelCell: {
    height: COLUMN,
    justifyContent: 'center',
  },
  dayLabelText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 4,
    marginBottom: GAP,
  },
  cellOutside: {
    backgroundColor: 'transparent',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.text,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 10,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginHorizontal: 2,
  },
});
