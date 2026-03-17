import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EventCategory } from '../../types/event.types';
import { CATEGORY_CONFIG } from '../../utils/event-category.utils';

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as EventCategory[];

type Props = {
  value: EventCategory;
  onChange: (category: EventCategory) => void;
};

/** Grille de sélection de catégorie d'événement. */
export function CategoryPicker({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {CATEGORIES.map((cat) => {
        const { emoji, label, color } = CATEGORY_CONFIG[cat];
        const isSelected = value === cat;
        return (
          <CategoryItem
            key={cat}
            emoji={emoji}
            label={label}
            color={color}
            selected={isSelected}
            onPress={() => onChange(cat)}
          />
        );
      })}
    </View>
  );
}

type ItemProps = {
  emoji: string;
  label: string;
  color: string;
  selected: boolean;
  onPress: () => void;
};

function CategoryItem({ emoji, label, color, selected, onPress }: ItemProps) {
  const handlePress = useCallback(onPress, [onPress]);
  return (
    <TouchableOpacity
      style={[styles.item, selected && { borderColor: color, backgroundColor: color + '18' }]}
      onPress={handlePress}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.label, selected && { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    gap: 4,
  },
  emoji: { fontSize: 22 },
  label: { fontSize: 11, fontWeight: '600', color: '#64748B' },
});
