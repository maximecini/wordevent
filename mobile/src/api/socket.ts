import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4443';

let socket: Socket | null = null;
let chatSocket: Socket | null = null;

/**
 * Retourne le singleton Socket.IO pour le namespace /events.
 * Si un socket existe déjà avec un token différent, il est déconnecté et recréé.
 *
 * @param token - Access token JWT de l'utilisateur
 * @returns Instance Socket.IO connectée
 */
export function getSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket?.disconnect();

  socket = io(`${API_URL}/events`, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  return socket;
}

/**
 * Retourne le singleton Socket.IO pour le namespace /chat.
 * Si un socket existe déjà avec un token différent, il est déconnecté et recréé.
 *
 * @param token - Access token JWT de l'utilisateur
 * @returns Instance Socket.IO connectée au namespace /chat
 */
export function getChatSocket(token: string): Socket {
  if (chatSocket?.connected) return chatSocket;

  chatSocket?.disconnect();

  chatSocket = io(`${API_URL}/chat`, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 2000,
  });

  return chatSocket;
}

/**
 * Déconnecte et détruit les singletons Socket.IO.
 * À appeler lors du logout.
 */
export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  chatSocket?.disconnect();
  chatSocket = null;
}
