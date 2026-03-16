import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VisibilityFilter, useEventsStore } from '../../store/events.store';

type Props = {
  onOpenSheet: () => void;
};

const VISIBILITY_CHIPS: { label: string; emoji: string; value: VisibilityFilter; color: string; bg: string }[] = [
  { label: 'Tous',   emoji: '🌍', value: 'ALL',     color: '#2563EB', bg: '#EFF6FF' },
  { label: 'Public', emoji: '🟢', value: 'PUBLIC',  color: '#16A34A', bg: '#F0FDF4' },
  { label: 'Privé',  emoji: '🔒', value: 'PRIVATE', color: '#9333EA', bg: '#FAF5FF' },
];

/** Barre de filtres — sous la zone caméra, au-dessus de la carte. */
export function FilterBar({ onOpenSheet }: Props) {
  const { top } = useSafeAreaInsets();
  const visibilityFilter = useEventsStore((s) => s.visibilityFilter);
  const setVisibilityFilter = useEventsStore((s) => s.setVisibilityFilter);

  const handleVisibility = useCallback((v: VisibilityFilter) => setVisibilityFilter(v), [setVisibilityFilter]);

  return (
    <View style={[styles.wrapper, { top: top + 8 }]}>
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>

          {/* Chips visibilité — colorées avec emoji */}
          {VISIBILITY_CHIPS.map((c) => {
            const isActive = visibilityFilter === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.chip, isActive && { backgroundColor: c.bg, borderColor: c.color }]}
                onPress={() => handleVisibility(c.value)}
              >
                <Text style={styles.chipEmoji}>{c.emoji}</Text>
                <Text style={[styles.chipText, isActive && { color: c.color }]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.divider} />

          {/* Bouton filtres avancés */}
          <TouchableOpacity style={styles.chip} onPress={onOpenSheet}>
            <Text style={styles.chipEmoji}>🎚️</Text>
            <Text style={styles.chipText}>Filtres</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
    alignItems: 'center',
  },
  container: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
    alignItems: 'center',
  },

  // Segmented control
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  segmentFirst: { borderLeftWidth: 0 },
  segmentLast: { borderRightWidth: 0 },
  segmentActive: { backgroundColor: '#0F172A' },
  segmentText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  segmentTextActive: { color: '#fff' },

  // Chips visibilité
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipEmoji: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: '#64748B' },

  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },
});
