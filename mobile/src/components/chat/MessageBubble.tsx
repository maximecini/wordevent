import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageResponse } from '../../api/endpoints/messages.api';

interface Props {
  message: MessageResponse;
  isMine: boolean;
}

/** Bulle de message affichée dans le chat — alignée à droite si envoyée par l'user. */
export function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.row, isMine ? styles.rowRight : styles.rowLeft]}>
      {!isMine && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{message.senderName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        {!isMine && <Text style={styles.senderName}>{message.senderName}</Text>}
        <Text style={[styles.content, isMine ? styles.contentMine : styles.contentOther]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}>{time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginVertical: 4, paddingHorizontal: 12, alignItems: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  avatarText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  bubble: { maxWidth: '72%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#0F172A', borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: '#F1F5F9', borderBottomLeftRadius: 4 },
  senderName: { fontSize: 11, fontWeight: '700', color: '#64748B', marginBottom: 2 },
  content: { fontSize: 15, lineHeight: 21 },
  contentMine: { color: '#fff' },
  contentOther: { color: '#0F172A' },
  time: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeMine: { color: '#94A3B8' },
  timeOther: { color: '#94A3B8' },
});
