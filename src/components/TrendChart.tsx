import { LineChart, type lineDataItem } from 'react-native-gifted-charts';
import { type MoodEntry } from '@/db/entries';
import { shortDate } from '@/lib/dates';
import { moodColor } from '@/lib/mood';
import { colors } from '@/theme/colors';
import { EmptyState } from './EmptyState';

interface Props {
  entries: MoodEntry[];
  width: number;
}

const AXIS_TEXT = { color: colors.textSecondary, fontSize: 10 } as const;

export function TrendChart({ entries, width }: Props) {
  if (entries.length < 2) {
    return <EmptyState title="Not enough data" message="Log at least two days to see a trend." />;
  }

  const labelEvery = Math.max(1, Math.ceil(entries.length / 4));
  const manyPoints = entries.length > 31;
  const data: lineDataItem[] = entries.map((e, i) => ({
    value: e.mood,
    label: i % labelEvery === 0 ? shortDate(e.date) : undefined,
    labelTextStyle: { ...AXIS_TEXT, width: 40 },
    dataPointColor: moodColor(e.mood),
  }));

  return (
    <LineChart
      data={data}
      width={width - 44}
      height={180}
      adjustToWidth
      disableScroll
      maxValue={10}
      noOfSections={5}
      initialSpacing={8}
      endSpacing={8}
      thickness={2.5}
      color={colors.primary}
      hideDataPoints={manyPoints}
      dataPointsRadius={3.5}
      areaChart
      startFillColor={colors.primary}
      endFillColor={colors.primary}
      startOpacity={0.18}
      endOpacity={0.01}
      yAxisTextStyle={AXIS_TEXT}
      yAxisColor={colors.border}
      xAxisColor={colors.border}
      rulesColor={colors.border}
      rulesType="solid"
    />
  );
}
