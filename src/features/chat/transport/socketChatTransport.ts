import { io, type Socket } from "socket.io-client";
import { appConfig } from "@/config/appConfig";
import type { Message } from "@/entities/message/model/types";
import type {
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
  sendEvent: string;
  messageEvent: string;
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
  const socketUrl = `${options.url.replace(/\/$/, "")}${options.namespace}`;
  const socket: Socket = io(socketUrl, {
    path: options.path,
    autoConnect: false,
    transports: ["websocket", "polling"],
  });

  const messageListeners = new Set<(message: Message) => void>();
  const connectionListeners = new Set<(status: ChatConnectionStatus) => void>();

  function emitConnectionStatus(status: ChatConnectionStatus) {
    if (appConfig.isDevelopment) {
      console.info("[orbit:socket]", status);
    }

    connectionListeners.forEach((listener) => listener(status));
  }

  socket.on("connect", () => {
    emitConnectionStatus("connected");
  });

  socket.on("disconnect", () => {
    emitConnectionStatus("disconnected");
  });

  socket.io.on("reconnect_attempt", () => {
    emitConnectionStatus("reconnecting");
  });

  socket.io.on("reconnect", () => {
    emitConnectionStatus("connected");
  });

  socket.on(options.messageEvent, (payload: TransportIncomingMessage) => {
    const message = toDomainMessage(payload);
    messageListeners.forEach((listener) => listener(message));
  });

  return {
    connect() {
      if (socket.connected) {
        emitConnectionStatus("connected");
        return;
      }

      emitConnectionStatus("connecting");
      socket.connect();
    },
    disconnect() {
      socket.disconnect();
      emitConnectionStatus("disconnected");
    },
    sendMessage(message: TransportOutgoingMessage) {
      return new Promise<ChatSendResult>((resolve, reject) => {
        socket.timeout(options.ackTimeoutMs).emit(
          options.sendEvent,
          toOutgoingPayload(message),
          (
            error: Error | null,
            payload?: TransportIncomingMessage,
          ) => {
            if (error) {
              reject(error);
              return;
            }

            const resolvedPayload: TransportIncomingMessage =
              payload ??
              ({
                id: message.clientMessageId,
                clientMessageId: message.clientMessageId,
                serverMessageId: undefined,
                channelId: message.channelId,
                userId: message.userId,
                username: message.username,
                avatarFallback: message.avatarFallback,
                content: message.content,
                createdAt: message.createdAt,
                type: message.type,
              } satisfies TransportIncomingMessage);

            resolve({
              clientMessageId: message.clientMessageId,
              message: toDomainMessage(resolvedPayload),
            });
          },
        );
      });
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
