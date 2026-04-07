import { describe, expect, it, vi } from "vitest";
import { getSharedSocketManager } from "@/features/chat/socket/socketManager";
import type { SocketManagerOptions } from "@/features/chat/socket/socketManager";

interface FakeSocket {
  connected: boolean;
  handlers: Map<string, (payload?: unknown) => void>;
  io: {
    handlers: Map<string, () => void>;
    on: (event: string, callback: () => void) => void;
  };
  connect: () => void;
  disconnect: () => void;
  on: (event: string, callback: (payload?: unknown) => void) => void;
  emit: (event: string, payload?: unknown, callback?: (error: Error | null, payload?: unknown) => void) => void;
  timeout: () => FakeSocket;
}

function createSocketHarness() {
  const emitted: Array<{ event: string; payload?: unknown }> = [];
  const handlers = new Map<string, (payload?: unknown) => void>();
  const reconnectHandlers = new Map<string, () => void>();

  const socket: FakeSocket = {
    connected: false,
    handlers,
    io: {
      handlers: reconnectHandlers,
      on(event, callback) {
        reconnectHandlers.set(event, callback);
      },
    },
    connect() {
      socket.connected = true;
    },
    disconnect() {
      socket.connected = false;
    },
    on(event, callback) {
      handlers.set(event, callback);
    },
    emit(event, payload, callback) {
      emitted.push({ event, payload });

      if (event === "chat:message:send" && callback) {
        callback(null, {
          id: "srv_1",
          clientMessageId: "client_1",
          channelId: "group_1",
          userId: "user_demo",
          username: "Demo Orbit",
          avatarFallback: "DO",
          content: "Hello",
          createdAt: "2026-04-07T10:00:00.000Z",
          type: "text",
        });
      }
    },
    timeout() {
      return socket;
    },
  };

  return {
    emitted,
    socket,
    trigger(event: string, payload?: unknown) {
      handlers.get(event)?.(payload);
    },
    triggerReconnect(event: string) {
      reconnectHandlers.get(event)?.();
    },
  };
}

function createManagerOptions(socketFactory: SocketManagerOptions["socketFactory"]): SocketManagerOptions {
  return {
    url: "http://localhost:8000",
    path: "/socket.io",
    namespace: "/chat",
    authToken: `token_${Math.random()}`,
    sendEvent: "chat:message:send",
    messageEvent: "chat:message",
    joinRoomEvent: "chat:room:join",
    leaveRoomEvent: "chat:room:leave",
    typingEvent: "chat:typing",
    typingStartEvent: "chat:typing:start",
    typingStopEvent: "chat:typing:stop",
    ackTimeoutMs: 1000,
    socketFactory,
  };
}

describe("socketManager", () => {
  it("joins and leaves rooms without duplicate joins", () => {
    const harness = createSocketHarness();
    const manager = getSharedSocketManager(
      createManagerOptions(() => harness.socket as never),
    );

    manager.connect();
    manager.joinRoom("group_1");
    manager.joinRoom("group_1");
    manager.joinRoom("group_2");
    manager.leaveRoom("group_2");

    expect(
      harness.emitted.filter((entry) => entry.event === "chat:room:join"),
    ).toHaveLength(2);
    expect(
      harness.emitted.filter((entry) => entry.event === "chat:room:leave"),
    ).toHaveLength(2);
  });

  it("exposes connection status and typing events", () => {
    const harness = createSocketHarness();
    const manager = getSharedSocketManager(
      createManagerOptions(() => harness.socket as never),
    );
    const connectionStates: string[] = [];
    const typingEvents: string[] = [];

    manager.subscribeToConnectionStatus((status) => {
      connectionStates.push(status);
    });
    manager.subscribeToTyping((event) => {
      typingEvents.push(`${event.channelId}:${event.username}:${event.isTyping}`);
    });

    manager.connect();
    harness.trigger("connect");
    harness.triggerReconnect("reconnect_attempt");
    harness.trigger("chat:typing", {
      channelId: "group_1",
      userId: "user_annie",
      username: "Annie Case",
      isTyping: true,
    });

    expect(connectionStates).toEqual(["connecting", "connected", "reconnecting"]);
    expect(typingEvents).toEqual(["group_1:Annie Case:true"]);
  });

  it("rejoins the active room after reconnecting", () => {
    const harness = createSocketHarness();
    const manager = getSharedSocketManager(
      createManagerOptions(() => harness.socket as never),
    );

    manager.joinRoom("group_1");
    manager.connect();
    harness.trigger("connect");

    expect(
      harness.emitted.filter((entry) => entry.event === "chat:room:join"),
    ).toHaveLength(1);
    expect(harness.emitted[0]).toMatchObject({
      event: "chat:room:join",
      payload: { roomId: "group_1", channelId: "group_1" },
    });
  });
});
