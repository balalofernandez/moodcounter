import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MOOD_VALUES, moodColor, moodLabel } from '@/lib/mood';
import { colors } from '@/theme/colors';

interface Props {
  value: number | null;
  onChange: (value: number) => void;
}

export function MoodScale({ value, onChange }: Props) {
  return (
    <View>
      <View style={styles.grid}>
        {MOOD_VALUES.map((v) => {
          const selected = v === value;
          return (
            <Pressable
              key={v}
              accessibilityLabel={`Mood ${v}, ${moodLabel(v)}`}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(v);
              }}
              style={[
                styles.pill,
                { backgroundColor: selected ? moodColor(v) : colors.card },
                selected ? styles.pillSelected : { borderColor: moodColor(v) },
              ]}
            >
              <Text style={[styles.pillText, { color: selected ? '#fff' : moodColor(v) }]}>
                {v}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.labels}>
        <Text style={styles.labelText}>Very bad</Text>
        <Text style={[styles.labelText, styles.labelCenter]}>
          {value != null ? moodLabel(value) : ' '}
        </Text>
        <Text style={styles.labelText}>Great</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  pillSelected: {
    borderWidth: 0,
    transform: [{ scale: 1.06 }],
  },
  pillText: {
    fontSize: 20,
    fontWeight: '700',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  labelText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  labelCenter: {
    fontWeight: '700',
    color: colors.text,
  },
});
