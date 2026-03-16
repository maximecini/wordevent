import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { usePlacesStore } from '../../store/places.store';
import { CreatePlacePayload } from '../../types/place.types';

type Props = {
  lat: number;
  lng: number;
  onClose: () => void;
};

const ICONS = ['📍', '⭐', '🏠', '🍕', '☕', '🏋️', '🎨', '🌳', '🛒', '🎵'];

/** Modal de création d'un point d'intérêt personnel. */
export function CreatePlaceSheet({ lat, lng, onClose }: Props) {
  const addPlace = usePlacesStore((s) => s.addPlace);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📍');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = name.trim().length > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const payload: CreatePlacePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        lat,
        lng,
      };
      await addPlace(payload);
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Erreur lors de la création du lieu');
    } finally {
      setSubmitting(false);
    }
  }, [name, description, icon, lat, lng, isValid, submitting, addPlace, onClose]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.heading}>Nouveau lieu</Text>
                <Text style={styles.coords}>📍 {lat.toFixed(5)}, {lng.toFixed(5)}</Text>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                  <Text style={styles.label}>Nom *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nom du lieu"
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.inputMulti]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Description optionnelle"
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                  />

                  <Text style={styles.label}>Icône</Text>
                  <View style={styles.iconRow}>
                    {ICONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        style={[styles.iconBtn, icon === emoji && styles.iconBtnActive]}
                        onPress={() => setIcon(emoji)}
                      >
                        <Text style={styles.iconEmoji}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {error && <Text style={styles.error}>{error}</Text>}

                <TouchableOpacity
                  style={[styles.submitBtn, !isValid && styles.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={!isValid || submitting}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitText}>Enregistrer le lieu</Text>
                  }
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    marginBottom: 4,
    textAlign: 'center',
  },
  coords: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 16,
  },
  scroll: { maxHeight: 320 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: { borderColor: '#0F172A', backgroundColor: '#F1F5F9' },
  iconEmoji: { fontSize: 22 },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: '#CBD5E1' },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  error: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginTop: 12 },
});
