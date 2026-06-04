import { StyleSheet, Text } from 'react-native';
import { BarChart, type barDataItem } from 'react-native-gifted-charts';
import { type Profile } from '@/db/profiles';
import { type ProfileComparison } from '@/db/stats';
import { colors } from '@/theme/colors';
import { EmptyState } from './EmptyState';

interface Props {
  profiles: Profile[];
  comparison: ProfileComparison[];
  width: number;
}

const AXIS_TEXT = { color: colors.textSecondary, fontSize: 10 } as const;

export function ComparisonChart({ profiles, comparison, width }: Props) {
  const byId = new Map(comparison.map((c) => [c.profile_id, c]));
  const withData = profiles.filter((p) => byId.has(p.id));

  if (withData.length === 0) {
    return <EmptyState title="No entries in this range" />;
  }

  const data: barDataItem[] = withData.map((p) => {
    const c = byId.get(p.id)!;
    const avg = Math.round(c.avg_mood * 10) / 10;
    return {
      value: avg,
      label: p.name.length > 7 ? `${p.name.slice(0, 6)}…` : p.name,
      labelTextStyle: AXIS_TEXT,
      frontColor: p.color,
      topLabelComponent: () => <Text style={styles.topLabel}>{avg}</Text>,
    };
  });

  return (
    <BarChart
      data={data}
      width={width - 44}
      height={150}
      adjustToWidth
      disableScroll
      barWidth={Math.min(44, Math.max(20, Math.floor((width - 120) / withData.length)))}
      barBorderRadius={6}
      maxValue={10}
      noOfSections={5}
      initialSpacing={12}
      yAxisTextStyle={AXIS_TEXT}
      yAxisColor={colors.border}
      xAxisColor={colors.border}
      rulesColor={colors.border}
      rulesType="solid"
    />
  );
}

const styles = StyleSheet.create({
  topLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
});
