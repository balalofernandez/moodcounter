import { subMonths } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { DistributionChart } from '@/components/DistributionChart';
import { MovingAverageChart } from '@/components/MovingAverageChart';
import { ProfileEditorModal, type ProfileFields } from '@/components/ProfileEditorModal';
import { RangeSelector } from '@/components/RangeSelector';
import { StatTile } from '@/components/StatTile';
import { TrendChart } from '@/components/TrendChart';
import { YearGrid } from '@/components/YearGrid';
import { YearHeatmap } from '@/components/YearHeatmap';
import { getEntriesInRange } from '@/db/entries';
import { updateProfile } from '@/db/profiles';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { shortDate, toDayKey, todayKey, type DayKey } from '@/lib/dates';
import { moodColor } from '@/lib/mood';
import { type RangeKey } from '@/lib/ranges';
import { colors } from '@/theme/colors';

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const profileId = Number(id);
  const router = useRouter();
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();

  const [range, setRange] = useState<RangeKey>('1M');
  const { profile, entries, summary, distribution, movingAvg, streak, refresh } =
    useProfileStats(profileId, range);

  const [editorVisible, setEditorVisible] = useState(false);
  const [calendarMode, setCalendarMode] = useState<'year' | 'month'>('year');

  // Heatmap covers ~13 months regardless of the selected range.
  const [moodByDate, setMoodByDate] = useState<Map<DayKey, number>>(new Map());
  const refreshHeatmap = useCallback(() => {
    const end = todayKey();
    const start = toDayKey(subMonths(new Date(), 13));
    getEntriesInRange(db, profileId, start, end).then((rows) => {
      setMoodByDate(new Map(rows.map((e) => [e.date, e.mood])));
    });
  }, [db, profileId]);
  useRefreshOnFocus(refreshHeatmap);

  const handleSaveProfile = useCallback(
    async (fields: ProfileFields) => {
      await updateProfile(db, profileId, fields);
      setEditorVisible(false);
      refresh();
    },
    [db, profileId, refresh],
  );

  const cardWidth = width - 32;
  const chartWidth = cardWidth - 28;

  return (
    <>
      <Stack.Screen
        options={{
          title: profile ? `${profile.emoji ? `${profile.emoji} ` : ''}${profile.name}` : '',
          headerRight: () => (
            <Pressable onPress={() => setEditorVisible(true)} hitSlop={10}>
              <Text style={styles.editButton}>Edit</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Pressable
          style={styles.logButton}
          onPress={() => router.push(`/log/${profileId}`)}
        >
          <Text style={styles.logButtonText}>Log today&apos;s mood</Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tilesRow}
        >
          <StatTile
            label="Average"
            value={summary.avgMood != null ? summary.avgMood.toFixed(1) : '—'}
            accentColor={summary.avgMood != null ? moodColor(summary.avgMood) : undefined}
          />
          <StatTile
            label="Best"
            value={summary.best ? String(summary.best.mood) : '—'}
            sub={summary.best ? shortDate(summary.best.date) : undefined}
            accentColor={summary.best ? moodColor(summary.best.mood) : undefined}
          />
          <StatTile
            label="Worst"
            value={summary.worst ? String(summary.worst.mood) : '—'}
            sub={summary.worst ? shortDate(summary.worst.date) : undefined}
            accentColor={summary.worst ? moodColor(summary.worst.mood) : undefined}
          />
          <StatTile label="Streak" value={String(streak)} sub="days" />
          <StatTile label="Entries" value={String(summary.count)} />
        </ScrollView>

        <RangeSelector value={range} onChange={setRange} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood trend</Text>
          <TrendChart entries={entries} width={chartWidth} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>7-day moving average</Text>
          <MovingAverageChart points={movingAvg} width={chartWidth} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood distribution</Text>
          <DistributionChart counts={distribution} width={chartWidth} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Calendar</Text>
            <View style={styles.modeToggle}>
              {(['year', 'month'] as const).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setCalendarMode(mode)}
                  style={[styles.modeSegment, calendarMode === mode && styles.modeSegmentSelected]}
                >
                  <Text
                    style={[styles.modeText, calendarMode === mode && styles.modeTextSelected]}
                  >
                    {mode === 'year' ? 'Year' : 'Month'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Text style={styles.cardSub}>
            {calendarMode === 'year'
              ? 'The whole year at a glance. Tap a day to log or edit.'
              : 'Swipe to browse the past year. Tap a day to log or edit.'}
          </Text>
          {calendarMode === 'year' ? (
            <YearGrid
              moodByDate={moodByDate}
              onDayPress={(date) => router.push(`/log/${profileId}?date=${date}`)}
            />
          ) : (
            <YearHeatmap
              moodByDate={moodByDate}
              onDayPress={(date) => router.push(`/log/${profileId}?date=${date}`)}
              width={cardWidth - 20}
            />
          )}
        </View>
      </ScrollView>

      <ProfileEditorModal
        visible={editorVisible}
        profile={profile}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  editButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  logButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  tilesRow: {
    gap: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    paddingBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 8,
    padding: 2,
    marginBottom: 10,
  },
  modeSegment: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modeSegmentSelected: {
    backgroundColor: colors.card,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modeTextSelected: {
    color: colors.text,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -6,
    marginBottom: 8,
  },
});
