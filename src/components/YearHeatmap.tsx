import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CalendarList, type DateData } from 'react-native-calendars';
import { todayKey, type DayKey } from '@/lib/dates';
import { moodColor } from '@/lib/mood';
import { colors } from '@/theme/colors';

interface Props {
  /** mood value per logged day key */
  moodByDate: Map<DayKey, number>;
  onDayPress: (date: DayKey) => void;
  width: number;
}

interface DayCellProps {
  date?: DateData;
  state?: string;
  mood: number | undefined;
  onPress: (date: DayKey) => void;
}

function DayCell({ date, state, mood, onPress }: DayCellProps) {
  if (!date || state === 'disabled') {
    return <View style={styles.cell} />;
  }
  const today = todayKey();
  const isFuture = date.dateString > today;
  const isToday = date.dateString === today;
  const background = mood != null ? moodColor(mood) : isFuture ? 'transparent' : colors.noEntry;

  return (
    <Pressable
      disabled={isFuture}
      onPress={() => onPress(date.dateString)}
      style={[
        styles.cell,
        { backgroundColor: background },
        isToday && styles.todayCell,
      ]}
    >
      <Text
        style={[
          styles.cellText,
          mood != null && styles.cellTextOnColor,
          isFuture && styles.cellTextFuture,
        ]}
      >
        {date.day}
      </Text>
    </Pressable>
  );
}

export function YearHeatmap({ moodByDate, onDayPress, width }: Props) {
  return (
    <CalendarList
      horizontal
      pagingEnabled
      calendarWidth={width}
      pastScrollRange={12}
      futureScrollRange={0}
      maxDate={todayKey()}
      hideExtraDays
      firstDay={1}
      theme={{
        calendarBackground: 'transparent',
        monthTextColor: colors.text,
        textMonthFontWeight: '700',
        textSectionTitleColor: colors.textSecondary,
      }}
      dayComponent={({ date, state }) => (
        <DayCell
          date={date}
          state={state}
          mood={date ? moodByDate.get(date.dateString) : undefined}
          onPress={onDayPress}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  cell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCell: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  cellText: {
    fontSize: 13,
    color: colors.text,
  },
  cellTextOnColor: {
    color: '#fff',
    fontWeight: '600',
  },
  cellTextFuture: {
    color: colors.border,
  },
});
