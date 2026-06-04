import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { type Profile } from '@/db/profiles';
import { colors, PROFILE_COLORS, PROFILE_EMOJIS } from '@/theme/colors';

export interface ProfileFields {
  name: string;
  color: string;
  emoji: string | null;
}

interface Props {
  visible: boolean;
  /** null = create mode */
  profile: Profile | null;
  onClose: () => void;
  onSave: (fields: ProfileFields) => void;
}

export function ProfileEditorModal({ visible, profile, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PROFILE_COLORS[0]);
  const [emoji, setEmoji] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setName(profile?.name ?? '');
      setColor(profile?.color ?? PROFILE_COLORS[0]);
      setEmoji(profile?.emoji ?? null);
    }
  }, [visible, profile]);

  const canSave = name.trim().length > 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{profile ? 'Edit profile' : 'New profile'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoFocus={!profile}
            maxLength={30}
          />

          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.swatchRow}>
            {PROFILE_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  c === color && styles.swatchSelected,
                ]}
              />
            ))}
          </View>

          <Text style={styles.sectionLabel}>Emoji (optional)</Text>
          <View style={styles.swatchRow}>
            {PROFILE_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(emoji === e ? null : e)}
                style={[styles.emojiCell, e === emoji && styles.emojiSelected]}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, !canSave && styles.buttonDisabled]}
              disabled={!canSave}
              onPress={() => onSave({ name: name.trim(), color, emoji })}
            >
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
    gap: 10,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  emojiCell: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  emojiSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emojiText: {
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
