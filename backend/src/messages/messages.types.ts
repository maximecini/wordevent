export interface MessageResponse {
  id: string;
  content: string;
  eventId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  createdAt: string;
}
