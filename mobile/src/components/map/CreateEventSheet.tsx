import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createEvent } from '../../api/endpoints/events.api';
import { useEventsStore } from '../../store/events.store';

interface Props {
  lat: number;
  lng: number;
  onClose: () => void;
}

/**
 * Formulaire de création d'un événement à la position donnée.
 * S'affiche depuis le bouton + de la bottom nav.
 */
export function CreateEventSheet({ lat, lng, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('10');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const fetchNearby = useEventsStore((s) => s.fetchNearby);

  async function handleSubmit() {
    if (!title.trim()) return Alert.alert('Erreur', 'Le titre est requis');
    const startAt = new Date().toISOString();
    const endAt = new Date(Date.now() + 3_600_000 * 3).toISOString();
    try {
      await createEvent({ title, description, lat, lng, capacity: Number(capacity), visibility, startAt, endAt });
      await fetchNearby(lat, lng);
      onClose();
    } catch {
      Alert.alert('Erreur', 'Impossible de créer cet événement');
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Nouvel événement</Text>
      <TextInput style={styles.input} placeholder="Titre *" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Capacité" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
      <View style={styles.toggle}>
        {(['PUBLIC', 'PRIVATE'] as const).map((v) => (
          <TouchableOpacity key={v} style={[styles.toggleBtn, visibility === v && styles.toggleActive]} onPress={() => setVisibility(v)}>
            <Text style={[styles.toggleText, visibility === v && styles.toggleTextActive]}>{v === 'PUBLIC' ? '🌍 Public' : '🔒 Privé'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Créer l'événement</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelText}>Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 15, color: '#0F172A' },
  toggle: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
  toggleActive: { backgroundColor: '#0F172A' },
  toggleText: { fontWeight: '600', color: '#64748B' },
  toggleTextActive: { color: '#fff' },
  submitBtn: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 10 },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { padding: 12, alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontSize: 15 },
});
