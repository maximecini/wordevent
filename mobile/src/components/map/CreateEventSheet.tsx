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
import { useEventsStore } from '../../store/events.store';
import { CreateEventPayload, EventVisibility } from '../../types/event.types';

type Props = {
  lat: number;
  lng: number;
  onClose: () => void;
};

function buildDefaultDates() {
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Modal centré de création d'un événement — continuité visuelle avec CreateChoiceModal. */
export function CreateEventSheet({ lat, lng, onClose }: Props) {
  const adding = useEventsStore((s) => s.creating);
  const addEvent = useEventsStore((s) => s.addEvent);

  const defaults = buildDefaultDates();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [visibility, setVisibility] = useState<EventVisibility>('PUBLIC');
  const [startAt] = useState(defaults.start);
  const [endAt] = useState(defaults.end);

  const isValid = title.trim().length > 0 && Number(capacity) > 0;

  const handleSubmit = useCallback(async () => {
    if (!isValid) return;
    const payload: CreateEventPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      lat,
      lng,
      capacity: Number(capacity),
      visibility,
      startAt,
      endAt,
    };
    await addEvent(payload);
    onClose();
  }, [title, description, capacity, visibility, startAt, endAt, lat, lng, isValid]);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.card}>
                <Text style={styles.heading}>Nouvel événement</Text>
                <Text style={styles.coords}>📍 {lat.toFixed(5)}, {lng.toFixed(5)}</Text>

                <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
                  <Text style={styles.label}>Titre *</Text>
                  <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Nom de l'événement"
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

                  <Text style={styles.label}>Capacité *</Text>
                  <TextInput
                    style={styles.input}
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="number-pad"
                    placeholder="Nombre de participants max"
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.label}>Visibilité</Text>
                  <View style={styles.toggle}>
                    <TouchableOpacity
                      style={[styles.toggleBtn, visibility === 'PUBLIC' && styles.toggleActive]}
                      onPress={() => setVisibility('PUBLIC')}
                    >
                      <Text style={[styles.toggleText, visibility === 'PUBLIC' && styles.toggleTextActive]}>Public</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.toggleBtn, visibility === 'PRIVATE' && styles.toggleActive]}
                      onPress={() => setVisibility('PRIVATE')}
                    >
                      <Text style={[styles.toggleText, visibility === 'PRIVATE' && styles.toggleTextActive]}>Privé</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={[styles.submitBtn, !isValid && styles.submitDisabled]}
                  onPress={handleSubmit}
                  disabled={!isValid || adding}
                >
                  {adding
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitText}>Créer l'événement</Text>
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
  toggle: { flexDirection: 'row', gap: 8 },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  toggleActive: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#fff' },
  submitBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  submitDisabled: { backgroundColor: '#CBD5E1' },
  submitText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
