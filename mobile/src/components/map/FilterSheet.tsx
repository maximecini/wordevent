import React, { useCallback } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { VisibilityFilter, useEventsStore } from '../../store/events.store';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function formatRadius(m: number) {
  return m < 1000 ? `${m} m` : `${m / 1000} km`;
}

const VISIBILITY_OPTIONS: { label: string; sub: string; value: VisibilityFilter }[] = [
  { label: 'Tous',   sub: 'Events publics et privés',    value: 'ALL' },
  { label: 'Public', sub: 'Visibles par tous',           value: 'PUBLIC' },
  { label: 'Privé',  sub: 'Sur invitation uniquement',   value: 'PRIVATE' },
];

/** Sheet de filtres avancés — ouvert depuis la FilterBar. */
export function FilterSheet({ visible, onClose }: Props) {
  const visibilityFilter = useEventsStore((s) => s.visibilityFilter);
  const setVisibilityFilter = useEventsStore((s) => s.setVisibilityFilter);

  const handleVisibility = useCallback((v: VisibilityFilter) => setVisibilityFilter(v), [setVisibilityFilter]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.heading}>Filtres</Text>

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
  heading: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 10, marginTop: 8 },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  optionBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  optionBtnActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  optionText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  optionTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    marginBottom: 6, backgroundColor: '#F8FAFC',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  rowActive: { borderColor: '#6366F1', backgroundColor: '#EEF2FF' },
  rowText: { gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  rowSub: { fontSize: 12, color: '#94A3B8' },
  check: { fontSize: 16, color: '#6366F1', fontWeight: '700' },
  doneBtn: {
    marginTop: 20, paddingVertical: 14, borderRadius: 12,
    backgroundColor: '#6366F1', alignItems: 'center',
  },
  doneText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
