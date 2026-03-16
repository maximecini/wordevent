import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { EventResponse } from '../../api/endpoints/events.api';
import { useAuthStore } from '../../store/auth.store';
import { useEventsStore } from '../../store/events.store';

interface Props {
  event: EventResponse;
  onClose: () => void;
}

/**
 * Carte de détail d'un événement affichée en bas de la carte.
 * Permet de rejoindre, quitter ou fermer l'événement.
 */
export function EventDetailSheet({ event, onClose }: Props) {
  const user = useAuthStore((s) => s.user);
  const { join, leave } = useEventsStore();
  const fill = Math.round((event.participantCount / event.capacity) * 100);
  const isCreator = user?.id === event.creatorId;
  const startTime = new Date(event.startAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  async function handleJoin() {
    try { await join(event.id); }
    catch { Alert.alert('Erreur', 'Impossible de rejoindre cet événement'); }
  }

  async function handleLeave() {
    try { await leave(event.id); }
    catch { Alert.alert('Erreur', 'Impossible de quitter cet événement'); }
  }

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.close} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{event.title}</Text>
      {event.description ? <Text style={styles.desc}>{event.description}</Text> : null}

      <View style={styles.row}>
        <Text style={styles.meta}>👥 {event.participantCount}/{event.capacity}</Text>
        <Text style={styles.meta}>🕐 {startTime}</Text>
        <Text style={styles.meta}>{event.visibility === 'PRIVATE' ? '🔒 Privé' : '🌍 Public'}</Text>
      </View>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${fill}%` as any }]} />
      </View>

      {!isCreator && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
            <Text style={styles.joinText}>Rejoindre →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave}>
            <Text style={styles.leaveText}>Quitter</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, margin: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 },
  close: { position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 4, paddingRight: 40 },
  desc: { fontSize: 14, color: '#64748B', marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  meta: { fontSize: 13, color: '#475569' },
  progressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden', marginBottom: 16 },
  progressFill: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 3 },
  actions: { flexDirection: 'row', gap: 10 },
  joinBtn: { flex: 1, backgroundColor: '#0F172A', borderRadius: 12, padding: 14, alignItems: 'center' },
  joinText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  leaveBtn: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, paddingHorizontal: 18 },
  leaveText: { color: '#64748B', fontWeight: '600', fontSize: 15 },
});
