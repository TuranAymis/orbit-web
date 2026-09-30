import type { Message } from "@/entities/message/model/types";
import type {
  ChatConnectionStatus,
  ChatSendResult,
  ChatTransport,
  ChatTypingEvent,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendChatResponse {
  id: string;
  user_id: string;
  username?: string | null;
  group_id?: string | null;
  event_id?: string | null;
  content: string;
  created_at: string;
}

function mapChatResponse(
  payload: BackendChatResponse,
  fallback: TransportOutgoingMessage,
): Message {
  return {
    id: payload.id,
    clientMessageId: fallback.clientMessageId,
    serverMessageId: payload.id,
    channelId: payload.group_id ?? payload.event_id ?? fallback.channelId,
    userId: payload.user_id,
    username: payload.username ?? fallback.username,
    avatarFallback: fallback.avatarFallback,
    content: payload.content,
    createdAt: payload.created_at,
    type: "text",
    status: "sent",
    canRetry: false,
  };
}

export function createHttpChatTransport(): ChatTransport {
  const messageListeners = new Set<(message: Message) => void>();
  const typingListeners = new Set<(event: ChatTypingEvent) => void>();
  const connectionListeners = new Set<(status: ChatConnectionStatus) => void>();

  function emitConnectionStatus(status: ChatConnectionStatus) {
    connectionListeners.forEach((listener) => listener(status));
  }

  return {
    connect() {
      emitConnectionStatus("connected");
    },
    disconnect() {
      emitConnectionStatus("disconnected");
    },
    joinRoom() {},
    leaveRoom() {},
    async sendMessage(message: TransportOutgoingMessage): Promise<ChatSendResult> {
      const payload = await httpClient.post<BackendChatResponse>("/chats", {
        group_id: message.channelId,
        content: message.content,
      });

      const resolvedMessage = mapChatResponse(payload, message);
      messageListeners.forEach((listener) => listener(resolvedMessage));

      return {
        clientMessageId: message.clientMessageId,
        message: resolvedMessage,
      };
    },
    subscribeToMessages(callback) {
      messageListeners.add(callback);

      return () => {
        messageListeners.delete(callback);
      };
    },
    emitTyping() {},
    subscribeToTyping(callback) {
      typingListeners.add(callback);

      return () => {
        typingListeners.delete(callback);
      };
    },
    subscribeToConnectionStatus(callback) {
      connectionListeners.add(callback);

      return () => {
        connectionListeners.delete(callback);
      };
    },
  };
}
