import type { Message } from "@/entities/message/model/types";
import { mapChatMessage, type BackendChatMessage } from "@/entities/message/mappers";
import type {
  ChatConnectionStatus,
  ChatSendResult,
  ChatTransport,
  ChatTypingEvent,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";
import { httpClient } from "@/shared/lib/http/httpClient";

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
      const payload = await httpClient.post<BackendChatMessage>("/chats", {
        group_id: message.channelId,
        content: message.content,
      });

      const resolvedMessage = mapChatMessage(payload, {
        channelId: message.channelId,
        clientMessageId: message.clientMessageId,
        fallbackUsername: message.username,
        fallbackAvatar: message.avatarFallback,
      });
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
