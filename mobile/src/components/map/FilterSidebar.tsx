import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type Filter = 'PUBLIC' | 'PRIVATE' | null;

interface Props {
  active: Filter;
  onSelect: (filter: Filter) => void;
}

const FILTERS: { key: Filter; label: string; color: string }[] = [
  { key: null, label: 'Tout', color: '#0F172A' },
  { key: 'PUBLIC', label: 'Public', color: '#3B82F6' },
  { key: 'PRIVATE', label: 'Privé', color: '#6366F1' },
];

/**
 * Sidebar verticale de filtres sur la gauche de la carte.
 * Inspirée du design vibrant-social (V2 — icônes rondes flottantes).
 */
export function FilterSidebar({ active, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        return (
          <TouchableOpacity
            key={String(f.key)}
            style={[styles.button, isActive && { backgroundColor: f.color }]}
            onPress={() => onSelect(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {f.label[0]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 12, top: '40%',
    gap: 8, alignItems: 'center',
  },
  button: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  label: { fontSize: 11, fontWeight: '700', color: '#64748B' },
  labelActive: { color: '#fff' },
});
