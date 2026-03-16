import { create } from 'zustand';
import { MessageResponse, fetchMessages } from '../api/endpoints/messages.api';

interface MessagesState {
  messagesByEvent: Record<string, MessageResponse[]>;
  loadingByEvent: Record<string, boolean>;
  addMessage: (message: MessageResponse) => void;
  loadHistory: (eventId: string, cursor?: string) => Promise<void>;
  clearEvent: (eventId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
  messagesByEvent: {},
  loadingByEvent: {},

  /** Ajoute un message reçu en temps réel en tête de liste pour l'event correspondant. */
  addMessage: (message: MessageResponse) => {
    set((s) => ({
      messagesByEvent: {
        ...s.messagesByEvent,
        [message.eventId]: [message, ...(s.messagesByEvent[message.eventId] ?? [])],
      },
    }));
  },

  /**
   * Charge l'historique paginé des messages d'un événement.
   * Ajoute les messages chargés à la fin de la liste existante.
   *
   * @param eventId - UUID de l'événement
   * @param cursor - Curseur de pagination (date ISO du dernier message connu)
   */
  loadHistory: async (eventId: string, cursor?: string) => {
    if (get().loadingByEvent[eventId]) return;

    set((s) => ({ loadingByEvent: { ...s.loadingByEvent, [eventId]: true } }));

    try {
      const messages = await fetchMessages(eventId, cursor);
      set((s) => ({
        messagesByEvent: {
          ...s.messagesByEvent,
          [eventId]: [...(s.messagesByEvent[eventId] ?? []), ...messages],
        },
      }));
    } finally {
      set((s) => ({ loadingByEvent: { ...s.loadingByEvent, [eventId]: false } }));
    }
  },

  /** Vide les messages en mémoire pour un event (ex: après avoir quitté). */
  clearEvent: (eventId: string) => {
    set((s) => {
      const next = { ...s.messagesByEvent };
      delete next[eventId];
      return { messagesByEvent: next };
    });
  },
}));
