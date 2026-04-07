import { io, type Socket } from "socket.io-client";
import { appConfig } from "@/config/appConfig";
import type {
  ChatConnectionStatus,
  ChatTypingEvent,
  TransportIncomingMessage,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";

interface SocketManagerOptions {
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
  socketFactory?: typeof io;
}

interface SocketManager {
  connect: () => void;
  disconnect: () => void;
  joinRoom: (channelId: string) => void;
  leaveRoom: (channelId: string) => void;
  sendMessage: (message: TransportOutgoingMessage) => Promise<TransportIncomingMessage>;
  emitTyping: (event: ChatTypingEvent) => void;
  subscribeToMessages: (callback: (message: TransportIncomingMessage) => void) => () => void;
  subscribeToTyping: (callback: (event: ChatTypingEvent) => void) => () => void;
  subscribeToConnectionStatus: (callback: (status: ChatConnectionStatus) => void) => () => void;
}

type SocketFactory = typeof io;

type SharedSocketRecord = {
  key: string;
  manager: SocketManager;
};

let sharedSocketRecord: SharedSocketRecord | null = null;

function createManagerKey(options: SocketManagerOptions) {
  return [
    options.url,
    options.path,
    options.namespace,
    options.authToken ?? "anonymous",
  ].join("|");
}

function logSocket(details: string, payload?: Record<string, unknown>) {
  if (!appConfig.isDevelopment) {
    return;
  }

  console.info(`[orbit:socket-manager] ${details}`, payload ?? {});
}

function normalizeTypingEvent(payload: unknown): ChatTypingEvent | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const channelId =
    typeof data.channelId === "string"
      ? data.channelId
      : typeof data.group_id === "string"
        ? data.group_id
        : typeof data.roomId === "string"
          ? data.roomId
          : null;

  const userId =
    typeof data.userId === "string"
      ? data.userId
      : typeof data.sender_id === "string"
        ? data.sender_id
        : null;

  if (!channelId || !userId) {
    return null;
  }

  return {
    channelId,
    userId,
    username:
      typeof data.username === "string"
        ? data.username
        : typeof data.name === "string"
          ? data.name
          : "Orbit Member",
    isTyping: data.isTyping !== false,
  };
}

function createSocketManager(options: SocketManagerOptions): SocketManager {
  const socketFactory: SocketFactory = options.socketFactory ?? io;
  const socketUrl = `${options.url.replace(/\/$/, "")}${options.namespace}`;
  const socket: Socket = socketFactory(socketUrl, {
    path: options.path,
    autoConnect: false,
    transports: ["websocket", "polling"],
    auth: options.authToken ? { token: options.authToken } : undefined,
  });

  const messageListeners = new Set<(message: TransportIncomingMessage) => void>();
  const typingListeners = new Set<(event: ChatTypingEvent) => void>();
  const connectionListeners = new Set<(status: ChatConnectionStatus) => void>();
  let activeRoomId: string | null = null;

  function emitConnectionStatus(status: ChatConnectionStatus) {
    logSocket(`connection ${status}`, { activeRoomId });
    connectionListeners.forEach((listener) => listener(status));
  }

  socket.on("connect", () => {
    emitConnectionStatus("connected");

    if (activeRoomId) {
      socket.emit(options.joinRoomEvent, { roomId: activeRoomId, channelId: activeRoomId });
      logSocket("room rejoin", { channelId: activeRoomId });
    }
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
    logSocket("message received", { channelId: payload.channelId, messageId: payload.id });
    messageListeners.forEach((listener) => listener(payload));
  });

  socket.on(options.typingEvent, (payload: unknown) => {
    const normalizedPayload = normalizeTypingEvent(payload);

    if (!normalizedPayload) {
      return;
    }

    logSocket("typing event", {
      channelId: normalizedPayload.channelId,
      userId: normalizedPayload.userId,
      isTyping: normalizedPayload.isTyping,
    });
    typingListeners.forEach((listener) => listener(normalizedPayload));
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
      if (activeRoomId) {
        socket.emit(options.leaveRoomEvent, { roomId: activeRoomId, channelId: activeRoomId });
        logSocket("room leave", { channelId: activeRoomId });
        activeRoomId = null;
      }

      socket.disconnect();
      emitConnectionStatus("disconnected");
    },
    joinRoom(channelId) {
      if (!channelId || activeRoomId === channelId) {
        return;
      }

      if (activeRoomId) {
        socket.emit(options.leaveRoomEvent, { roomId: activeRoomId, channelId: activeRoomId });
        logSocket("room leave", { channelId: activeRoomId });
      }

      activeRoomId = channelId;

      if (socket.connected) {
        socket.emit(options.joinRoomEvent, { roomId: channelId, channelId });
      }

      logSocket("room join", { channelId });
    },
    leaveRoom(channelId) {
      if (!channelId || activeRoomId !== channelId) {
        return;
      }

      socket.emit(options.leaveRoomEvent, { roomId: channelId, channelId });
      logSocket("room leave", { channelId });
      activeRoomId = null;
    },
    sendMessage(message) {
      return new Promise<TransportIncomingMessage>((resolve, reject) => {
        socket.timeout(options.ackTimeoutMs).emit(
          options.sendEvent,
          {
            clientMessageId: message.clientMessageId,
            channelId: message.channelId,
            roomId: message.channelId,
            userId: message.userId,
            username: message.username,
            avatarFallback: message.avatarFallback,
            content: message.content,
            createdAt: message.createdAt,
            type: message.type,
          },
          (error: Error | null, payload?: TransportIncomingMessage) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(
              payload ??
                ({
                  id: message.clientMessageId,
                  clientMessageId: message.clientMessageId,
                  channelId: message.channelId,
                  userId: message.userId,
                  username: message.username,
                  avatarFallback: message.avatarFallback,
                  content: message.content,
                  createdAt: message.createdAt,
                  type: message.type,
                } satisfies TransportIncomingMessage),
            );
          },
        );
      });
    },
    emitTyping(event) {
      const eventName = event.isTyping
        ? options.typingStartEvent
        : options.typingStopEvent;

      socket.emit(eventName, {
        roomId: event.channelId,
        channelId: event.channelId,
        userId: event.userId,
        username: event.username,
        isTyping: event.isTyping,
      });

      logSocket("typing emit", {
        channelId: event.channelId,
        userId: event.userId,
        isTyping: event.isTyping,
      });
    },
    subscribeToMessages(callback) {
      messageListeners.add(callback);
      return () => {
        messageListeners.delete(callback);
      };
    },
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

export function getSharedSocketManager(options: SocketManagerOptions): SocketManager {
  const key = createManagerKey(options);

  if (sharedSocketRecord?.key === key) {
    return sharedSocketRecord.manager;
  }

  sharedSocketRecord?.manager.disconnect();
  sharedSocketRecord = {
    key,
    manager: createSocketManager(options),
  };

  return sharedSocketRecord.manager;
}

export type { SocketManager, SocketManagerOptions };
