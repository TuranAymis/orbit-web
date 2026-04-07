import type { Message } from "@/entities/message/model/types";
import { createHttpChatTransport } from "@/features/chat/transport/httpChatTransport";
import { getSharedSocketManager } from "@/features/chat/socket/socketManager";
import type {
  ChatTypingEvent,
  ChatConnectionStatus,
  ChatSendResult,
  ChatTransport,
  TransportIncomingMessage,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";

interface SocketChatTransportOptions {
  url: string;
  path: string;
  namespace: string;
  authToken?: string;
  sendEvent: string;
  messageEvent: string;
  joinRoomEvent: string;
  leaveRoomEvent: string;
  typingEvent: string;
  typingStartEvent: string;
  typingStopEvent: string;
  ackTimeoutMs: number;
}

function toDomainMessage(payload: TransportIncomingMessage): Message {
  return {
    id: payload.serverMessageId ?? payload.id,
    clientMessageId: payload.clientMessageId ?? payload.id,
    serverMessageId: payload.serverMessageId ?? payload.id,
    channelId: payload.channelId,
    userId: payload.userId,
    username: payload.username,
    avatarFallback: payload.avatarFallback,
    content: payload.content,
    createdAt: payload.createdAt,
    type: payload.type,
    status: "sent",
    canRetry: false,
  };
}

function toOutgoingPayload(message: TransportOutgoingMessage) {
  return {
    clientMessageId: message.clientMessageId,
    channelId: message.channelId,
    userId: message.userId,
    username: message.username,
    avatarFallback: message.avatarFallback,
    content: message.content,
    createdAt: message.createdAt,
    type: message.type,
  };
}

export function createSocketChatTransport(
  options: SocketChatTransportOptions,
): ChatTransport {
  const manager = getSharedSocketManager({
    ...options,
  });
  const fallbackTransport = createHttpChatTransport();
  const messageListeners = new Set<(message: Message) => void>();
  const typingListeners = new Set<(event: ChatTypingEvent) => void>();
  const connectionListeners = new Set<(status: ChatConnectionStatus) => void>();

  return {
    connect() {
      fallbackTransport.connect();
      manager.connect();
    },
    disconnect() {
      manager.disconnect();
      fallbackTransport.disconnect();
    },
    joinRoom(channelId) {
      manager.joinRoom(channelId);
    },
    leaveRoom(channelId) {
      manager.leaveRoom(channelId);
    },
    async sendMessage(message: TransportOutgoingMessage) {
      try {
        const payload = await manager.sendMessage(toOutgoingPayload(message));
        return {
          clientMessageId: message.clientMessageId,
          message: toDomainMessage(payload),
        };
      } catch {
        return fallbackTransport.sendMessage(message);
      }
    },
    emitTyping(event) {
      manager.emitTyping(event);
    },
    subscribeToMessages(callback) {
      messageListeners.add(callback);
      const unsubscribeManager = manager.subscribeToMessages((payload) => {
        const message = toDomainMessage(payload);
        messageListeners.forEach((listener) => listener(message));
      });

      const unsubscribeFallback = fallbackTransport.subscribeToMessages((message) => {
        messageListeners.forEach((listener) => listener(message));
      });

      return () => {
        messageListeners.delete(callback);
        unsubscribeManager();
        unsubscribeFallback();
      };
    },
    subscribeToTyping(callback) {
      typingListeners.add(callback);

      const unsubscribe = manager.subscribeToTyping((event) => {
        typingListeners.forEach((listener) => listener(event));
      });

      return () => {
        typingListeners.delete(callback);
        unsubscribe();
      };
    },
    subscribeToConnectionStatus(callback) {
      connectionListeners.add(callback);
      const unsubscribeManager = manager.subscribeToConnectionStatus((status) => {
        connectionListeners.forEach((listener) => listener(status));
      });
      const unsubscribeFallback = fallbackTransport.subscribeToConnectionStatus((status) => {
        if (status === "connected") {
          return;
        }

        connectionListeners.forEach((listener) => listener(status));
      });

      return () => {
        connectionListeners.delete(callback);
        unsubscribeManager();
        unsubscribeFallback();
      };
    },
  };
}
