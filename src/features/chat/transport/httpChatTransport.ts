import type { Message } from "@/entities/message/model/types";
import type {
  ChatConnectionStatus,
  ChatSendResult,
  ChatTransport,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";
import { httpClient } from "@/shared/lib/http/httpClient";

interface BackendChatResponse {
  id: string;
  sender_id: string;
  group_id?: string | null;
  event_id?: string | null;
  message: string;
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
    userId: payload.sender_id,
    username: fallback.username,
    avatarFallback: fallback.avatarFallback,
    content: payload.message,
    createdAt: payload.created_at,
    type: "text",
    status: "sent",
    canRetry: false,
  };
}

export function createHttpChatTransport(): ChatTransport {
  const messageListeners = new Set<(message: Message) => void>();
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
    async sendMessage(message: TransportOutgoingMessage): Promise<ChatSendResult> {
      const payload = await httpClient.post<BackendChatResponse>("/chats", {
        group_id: message.channelId,
        message: message.content,
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
    subscribeToConnectionStatus(callback) {
      connectionListeners.add(callback);

      return () => {
        connectionListeners.delete(callback);
      };
    },
  };
}
