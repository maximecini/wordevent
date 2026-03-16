import { useEffect } from 'react';
import { getChatSocket } from '../api/socket';
import { useAuthStore } from '../store/auth.store';
import { useMessagesStore } from '../store/messages.store';
import { MessageResponse } from '../api/endpoints/messages.api';

/**
 * Hook qui connecte le Socket.IO /chat, rejoint la room de l'event
 * et synchronise les messages en temps réel avec le store.
 * Charge aussi l'historique initial à l'ouverture.
 *
 * @param eventId - UUID de l'événement dont on écoute le chat
 */
export function useMessages(eventId: string): void {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { addMessage, loadHistory } = useMessagesStore();

  useEffect(() => {
    if (!accessToken) return;

    const socket = getChatSocket(accessToken);

    socket.emit('chat:join', eventId);
    loadHistory(eventId);

    socket.on('chat:message', (message: MessageResponse) => {
      if (message.eventId === eventId) addMessage(message);
    });

    return () => {
      socket.emit('chat:leave', eventId);
      socket.off('chat:message');
    };
  }, [accessToken, eventId]);
}
