import { LineChart, type lineDataItem } from 'react-native-gifted-charts';
import { type MovingAveragePoint } from '@/db/stats';
import { shortDate } from '@/lib/dates';
import { colors } from '@/theme/colors';
import { EmptyState } from './EmptyState';

interface Props {
  points: MovingAveragePoint[];
  width: number;
}

const AXIS_TEXT = { color: colors.textSecondary, fontSize: 10 } as const;

export function MovingAverageChart({ points, width }: Props) {
  if (points.length < 2) {
    return <EmptyState title="Not enough data" message="Log a few days to see the average." />;
  }

  const labelEvery = Math.max(1, Math.ceil(points.length / 4));
  const data: lineDataItem[] = points.map((p, i) => ({
    value: Math.round(p.value * 100) / 100,
    label: i % labelEvery === 0 ? shortDate(p.date) : undefined,
    labelTextStyle: { ...AXIS_TEXT, width: 40 },
  }));

  return (
    <LineChart
      data={data}
      width={width - 44}
      height={160}
      adjustToWidth
      disableScroll
      maxValue={10}
      noOfSections={5}
      initialSpacing={8}
      endSpacing={8}
      thickness={2.5}
      color="#9B59F7"
      curved
      hideDataPoints
      yAxisTextStyle={AXIS_TEXT}
      yAxisColor={colors.border}
      xAxisColor={colors.border}
      rulesColor={colors.border}
      rulesType="solid"
    />
  );
}
