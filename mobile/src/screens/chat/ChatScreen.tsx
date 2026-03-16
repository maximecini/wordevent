import React, { useState, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth.store';
import { useMessagesStore } from '../../store/messages.store';
import { getChatSocket } from '../../api/socket';
import { useMessages } from '../../hooks/useMessages';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { MapStackParamList } from '../../navigation/AppNavigator';

type ChatRouteProp = RouteProp<MapStackParamList, 'Chat'>;

/** Écran de chat de groupe d'un événement. */
export function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const navigation = useNavigation();
  const { eventId, eventTitle } = route.params;

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const messages = useMessagesStore((s) => s.messagesByEvent[eventId] ?? []);
  const loadHistory = useMessagesStore((s) => s.loadHistory);
  const loading = useMessagesStore((s) => s.loadingByEvent[eventId] ?? false);

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useMessages(eventId);

  function sendMessage() {
    const content = input.trim();
    if (!content || !accessToken) return;
    const socket = getChatSocket(accessToken);
    socket.emit('chat:send', { eventId, content });
    setInput('');
  }

  function loadMore() {
    if (loading || messages.length === 0) return;
    const oldest = messages[messages.length - 1].createdAt;
    loadHistory(eventId, oldest);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{eventTitle}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} isMine={item.senderId === user?.id} />
          )}
          inverted
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun message — soyez le premier !</Text>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Votre message…"
            placeholderTextColor="#94A3B8"
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <Text style={styles.sendText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { marginRight: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 18, color: '#0F172A' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: '#0F172A' },
  list: { paddingVertical: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 8 },
  input: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#0F172A', maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#CBD5E1' },
  sendText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
