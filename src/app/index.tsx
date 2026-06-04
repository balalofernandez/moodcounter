import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ComparisonChart } from '@/components/ComparisonChart';
import { EmptyState } from '@/components/EmptyState';
import { ProfileCard } from '@/components/ProfileCard';
import { ProfileEditorModal, type ProfileFields } from '@/components/ProfileEditorModal';
import { RangeSelector } from '@/components/RangeSelector';
import { type Profile } from '@/db/profiles';
import { getProfilesComparison, type ProfileComparison } from '@/db/stats';
import { useProfiles } from '@/hooks/useProfiles';
import { rangeBounds, type RangeKey } from '@/lib/ranges';
import { colors } from '@/theme/colors';

export default function OverviewScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { width } = useWindowDimensions();
  const { overviews, loading, refresh, addProfile, editProfile, removeProfile } = useProfiles();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [comparisonRange, setComparisonRange] = useState<RangeKey>('1M');
  const [comparison, setComparison] = useState<ProfileComparison[]>([]);

  useEffect(() => {
    let cancelled = false;
    const { start, end } = rangeBounds(comparisonRange);
    getProfilesComparison(db, start, end).then((result) => {
      if (!cancelled) setComparison(result);
    });
    return () => {
      cancelled = true;
    };
  }, [db, comparisonRange, overviews]);

  const openCreate = useCallback(() => {
    setEditingProfile(null);
    setEditorVisible(true);
  }, []);

  const handleSave = useCallback(
    async (fields: ProfileFields) => {
      if (editingProfile) {
        await editProfile(editingProfile.id, fields);
      } else {
        await addProfile(fields.name, fields.color, fields.emoji);
      }
      setEditorVisible(false);
    },
    [editingProfile, editProfile, addProfile],
  );

  const handleLongPress = useCallback(
    (profile: Profile) => {
      Alert.alert(profile.name, undefined, [
        {
          text: 'Edit',
          onPress: () => {
            setEditingProfile(profile);
            setEditorVisible(true);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              `Delete ${profile.name}?`,
              'All mood entries for this profile will be deleted. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => removeProfile(profile.id),
                },
              ],
            );
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [removeProfile],
  );

  const profiles = overviews.map((o) => o.profile);
  const cardWidth = width - 32; // screen padding

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={openCreate} hitSlop={10}>
              <Text style={styles.addButton}>＋</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {!loading && overviews.length === 0 ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No profiles yet"
              message="Create a profile for each person whose mood you want to track. No accounts needed — everything stays on this phone."
            />
            <Pressable style={styles.createButton} onPress={openCreate}>
              <Text style={styles.createButtonText}>Create profile</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {overviews.map((overview) => (
              <ProfileCard
                key={overview.profile.id}
                overview={overview}
                onPress={() => router.push(`/profile/${overview.profile.id}`)}
                onLogPress={() => router.push(`/log/${overview.profile.id}`)}
                onLongPress={() => handleLongPress(overview.profile)}
              />
            ))}

            {overviews.length >= 2 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compare profiles</Text>
                <Text style={styles.sectionSub}>Average mood per profile</Text>
                <View style={styles.rangeWrap}>
                  <RangeSelector value={comparisonRange} onChange={setComparisonRange} />
                </View>
                <ComparisonChart
                  profiles={profiles}
                  comparison={comparison}
                  width={cardWidth - 28}
                />
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <ProfileEditorModal
        visible={editorVisible}
        profile={editingProfile}
        onClose={() => setEditorVisible(false)}
        onSave={handleSave}
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
    gap: 12,
    paddingBottom: 40,
  },
  addButton: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  emptyWrap: {
    marginTop: 80,
    alignItems: 'center',
    gap: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 10,
  },
  rangeWrap: {
    marginBottom: 14,
  },
});
