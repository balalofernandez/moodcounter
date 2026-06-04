import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MoodScale } from '@/components/MoodScale';
import { getProfile, type Profile } from '@/db/profiles';
import { useEntry } from '@/hooks/useEntry';
import { addDaysToKey, longDate, todayKey } from '@/lib/dates';
import { colors } from '@/theme/colors';

export default function LogMoodScreen() {
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const profileId = Number(params.id);
  const router = useRouter();
  const db = useSQLiteContext();

  const [date, setDate] = useState(params.date ?? todayKey());
  const { entry, loading, save, remove } = useEntry(profileId, date);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    getProfile(db, profileId).then(setProfile);
  }, [db, profileId]);

  // Sync form state when the loaded entry (or selected date) changes.
  useEffect(() => {
    if (!loading) {
      setMood(entry?.mood ?? null);
      setNote(entry?.note ?? '');
    }
  }, [entry, loading]);

  const isToday = date === todayKey();

  const handleSave = useCallback(async () => {
    if (mood == null) return;
    await save(mood, note.trim().length > 0 ? note.trim() : null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }, [mood, note, save, router]);

  const handleDelete = useCallback(() => {
    Alert.alert('Delete entry?', `Remove the mood logged for ${longDate(date)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove();
          router.back();
        },
      },
    ]);
  }, [date, remove, router]);

  return (
    <>
      <Stack.Screen
        options={{ title: profile ? `Log mood · ${profile.name}` : 'Log mood' }}
      />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.dateRow}>
            <Pressable
              hitSlop={10}
              onPress={() => setDate(addDaysToKey(date, -1))}
              style={styles.dateArrow}
            >
              <Text style={styles.dateArrowText}>‹</Text>
            </Pressable>
            <View style={styles.dateCenter}>
              <Text style={styles.dateText}>{isToday ? 'Today' : longDate(date)}</Text>
              {isToday ? <Text style={styles.dateSub}>{longDate(date)}</Text> : null}
            </View>
            <Pressable
              hitSlop={10}
              disabled={isToday}
              onPress={() => setDate(addDaysToKey(date, 1))}
              style={[styles.dateArrow, isToday && styles.dateArrowDisabled]}
            >
              <Text style={styles.dateArrowText}>›</Text>
            </Pressable>
          </View>

          <Text style={styles.question}>How {isToday ? 'are' : 'were'} you feeling?</Text>

          <MoodScale value={mood} onChange={setMood} />

          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={500}
          />

          <Pressable
            style={[styles.saveButton, mood == null && styles.saveButtonDisabled]}
            disabled={mood == null}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>{entry ? 'Update' : 'Save'}</Text>
          </Pressable>

          {entry ? (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete entry</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 40,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateArrowDisabled: {
    opacity: 0.3,
  },
  dateArrowText: {
    fontSize: 24,
    color: colors.text,
    marginTop: -2,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  dateSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '600',
  },
});
