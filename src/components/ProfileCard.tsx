import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type ProfileOverview } from '@/hooks/useProfiles';
import { moodColor } from '@/lib/mood';
import { colors } from '@/theme/colors';
import { Sparkline } from './Sparkline';

interface Props {
  overview: ProfileOverview;
  onPress: () => void;
  onLogPress: () => void;
  onLongPress: () => void;
}

export function ProfileCard({ overview, onPress, onLogPress, onLongPress }: Props) {
  const { profile, todayEntry, avg30, totalCount, spark } = overview;

  return (
    <Pressable style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: profile.color }]}>
          <Text style={styles.avatarText}>
            {profile.emoji ?? profile.name.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.sub}>
            {totalCount} {totalCount === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
        {todayEntry ? (
          <Pressable
            onPress={onLogPress}
            style={[styles.todayChip, { backgroundColor: moodColor(todayEntry.mood) }]}
          >
            <Text style={styles.todayChipText}>{todayEntry.mood}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={onLogPress} style={styles.logButton}>
            <Text style={styles.logButtonText}>Log today</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.statLabel}>30-day avg</Text>
          <Text
            style={[
              styles.statValue,
              avg30 != null ? { color: moodColor(avg30) } : null,
            ]}
          >
            {avg30 != null ? avg30.toFixed(1) : '—'}
          </Text>
        </View>
        <Sparkline values={spark.map((e) => e.mood)} color={profile.color} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
  todayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayChipText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  logButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
});
