import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onChooseEvent: () => void;
  onChoosePlace: () => void;
};

/** Modal centré — choix entre créer un événement ou un lieu. */
export function CreateChoiceModal({ visible, onClose, onChooseEvent, onChoosePlace }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.heading}>Que voulez-vous créer ?</Text>

              <TouchableOpacity style={styles.option} onPress={onChooseEvent}>
                <Text style={styles.optionIcon}>📅</Text>
                <View>
                  <Text style={styles.optionTitle}>Événement</Text>
                  <Text style={styles.optionSub}>Public ou privé, avec participants</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.option, styles.optionDisabled]} onPress={onChoosePlace}>
                <Text style={styles.optionIcon}>📍</Text>
                <View>
                  <Text style={[styles.optionTitle, styles.optionTitleDisabled]}>Lieu</Text>
                  <Text style={styles.optionSub}>Point d'intérêt personnel</Text>
                </View>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionIcon: { fontSize: 26 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  optionTitleDisabled: { color: '#64748B' },
  optionSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
});
