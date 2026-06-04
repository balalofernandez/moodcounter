import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RANGE_KEYS, type RangeKey } from '@/lib/ranges';
import { colors } from '@/theme/colors';

interface Props {
  value: RangeKey;
  onChange: (key: RangeKey) => void;
}

export function RangeSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {RANGE_KEYS.map((key) => {
        const selected = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{key}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentSelected: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  textSelected: {
    color: colors.text,
  },
});
