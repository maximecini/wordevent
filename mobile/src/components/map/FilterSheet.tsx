import React, { useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { RADIUS_OPTIONS, RadiusOption, VisibilityFilter, useEventsStore } from '../../store/events.store';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function formatRadius(m: number) {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

const VISIBILITY_OPTIONS: { label: string; sub: string; value: VisibilityFilter }[] = [
  { label: 'Tous', sub: 'Events publics et privés', value: 'ALL' },
  { label: 'Public', sub: 'Visibles par tous', value: 'PUBLIC' },
  { label: 'Privé', sub: 'Sur invitation uniquement', value: 'PRIVATE' },
];

/** Sheet de filtres avancés — ouvert depuis la FilterBar. */
export function FilterSheet({ visible, onClose }: Props) {
  const activeRadius = useEventsStore((s) => s.activeRadius);
  const visibilityFilter = useEventsStore((s) => s.visibilityFilter);
  const setRadius = useEventsStore((s) => s.setRadius);
  const setVisibilityFilter = useEventsStore((s) => s.setVisibilityFilter);

  const handleRadius = useCallback((r: RadiusOption) => setRadius(r), [setRadius]);
  const handleVisibility = useCallback((v: VisibilityFilter) => setVisibilityFilter(v), [setVisibilityFilter]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.heading}>Filtres</Text>

              <Text style={styles.sectionLabel}>Rayon de recherche</Text>
              <View style={styles.optionRow}>
                {RADIUS_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.optionBtn, activeRadius === r && styles.optionBtnActive]}
                    onPress={() => handleRadius(r)}
                  >
                    <Text style={[styles.optionText, activeRadius === r && styles.optionTextActive]}>
                      {formatRadius(r)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sectionLabel}>Visibilité</Text>
              {VISIBILITY_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.row, visibilityFilter === o.value && styles.rowActive]}
                  onPress={() => handleVisibility(o.value)}
                >
                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle}>{o.label}</Text>
                    <Text style={styles.rowSub}>{o.sub}</Text>
                  </View>
                  {visibilityFilter === o.value && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
                <Text style={styles.doneText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  handle: {
    width: 40, height: 4, backgroundColor: '#E2E8F0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  heading: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 10, marginTop: 8 },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  optionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  optionBtnActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  optionTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    marginBottom: 6, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  rowActive: { borderColor: '#0F172A', backgroundColor: '#F1F5F9' },
  rowText: { gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#0F172A' },
  rowSub: { fontSize: 12, color: '#94A3B8' },
  check: { fontSize: 16, color: '#0F172A', fontWeight: '700' },
  doneBtn: {
    marginTop: 20, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#0F172A', alignItems: 'center',
  },
  doneText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
