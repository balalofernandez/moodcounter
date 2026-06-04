import { BarChart, type barDataItem } from 'react-native-gifted-charts';
import { MOOD_MIN, moodColor } from '@/lib/mood';
import { colors } from '@/theme/colors';
import { EmptyState } from './EmptyState';

interface Props {
  /** Counts per mood value, index 0 = mood 1. */
  counts: number[];
  width: number;
}

const AXIS_TEXT = { color: colors.textSecondary, fontSize: 10 } as const;

export function DistributionChart({ counts, width }: Props) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return <EmptyState title="No entries in this range" />;
  }

  const data: barDataItem[] = counts.map((n, i) => ({
    value: n,
    label: String(MOOD_MIN + i),
    labelTextStyle: AXIS_TEXT,
    frontColor: moodColor(MOOD_MIN + i),
  }));
  const maxCount = Math.max(...counts);

  return (
    <BarChart
      data={data}
      width={width - 44}
      height={140}
      adjustToWidth
      disableScroll
      barWidth={Math.max(12, Math.floor((width - 130) / counts.length))}
      barBorderRadius={4}
      maxValue={Math.max(4, maxCount)}
      noOfSections={4}
      initialSpacing={8}
      yAxisTextStyle={AXIS_TEXT}
      yAxisColor={colors.border}
      xAxisColor={colors.border}
      rulesColor={colors.border}
      rulesType="solid"
    />
  );
}
