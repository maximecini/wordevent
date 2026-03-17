import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [barHeight, setBarHeight] = useState(44);

  const activeChip = VISIBILITY_CHIPS.find((c) => c.value === visibilityFilter)!;

  const handleSelect = useCallback((v: VisibilityFilter) => {
    setVisibilityFilter(v);
    setDropdownOpen(false);
  }, [setVisibilityFilter]);

  const onBarLayout = useCallback((e: LayoutChangeEvent) => {
    setBarHeight(e.nativeEvent.layout.height);
  }, []);

  return (
    <View style={[styles.wrapper, { top: top + 8 }]} pointerEvents="box-none">

      {/* Barre principale */}
      <View style={styles.container} onLayout={onBarLayout}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>

          {/* Bouton filtre groupé */}
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: activeChip.bg, borderColor: activeChip.color }]}
            onPress={() => setDropdownOpen((o) => !o)}
          >
            <Text style={styles.chipEmoji}>{activeChip.emoji}</Text>
            <Text style={[styles.chipText, { color: activeChip.color }]}>{activeChip.label}</Text>
            <Text style={[styles.chevron, { color: activeChip.color }]}>{dropdownOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Bouton filtres avancés */}
          <TouchableOpacity style={styles.chip} onPress={onOpenSheet}>
            <Text style={styles.chipEmoji}>🎚️</Text>
            <Text style={styles.chipText}>Filtres</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>

      {/* Dropdown — positionné exactement sous la barre */}
      {dropdownOpen && (
        <View style={[styles.dropdown, { top: barHeight + 6 }]}>
          {VISIBILITY_CHIPS.map((c) => {
            const isActive = visibilityFilter === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.option, isActive && { backgroundColor: c.bg }]}
                onPress={() => handleSelect(c.value)}
              >
                <Text style={styles.optionEmoji}>{c.emoji}</Text>
                <Text style={[styles.optionLabel, isActive && { color: c.color }]}>{c.label}</Text>
                {isActive && <Text style={[styles.optionCheck, { color: c.color }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  container: {
    alignSelf: 'flex-start',
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
  chevron: { fontSize: 10, fontWeight: '700' },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
  },

  // Dropdown
  dropdown: {
    position: 'absolute',
    left: 0,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    minWidth: 160,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  optionEmoji: { fontSize: 15 },
  optionLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
  optionCheck: { fontSize: 14, fontWeight: '700' },
});
