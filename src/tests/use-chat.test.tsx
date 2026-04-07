import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { useChat } from "@/features/chat/model/useChat";
import type { AuthSession } from "@/features/auth/types";
import type { Message } from "@/entities/message/model/types";
import { readChatPreferences } from "@/features/chat/model/chatPreferences";
import { createOrbitQueryClient } from "@/shared/lib/query/query-client";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";
import type {
  ChatConnectionStatus,
  ChatTransport,
  ChatTypingEvent,
} from "@/features/chat/transport/chatTransport";

const demoSession: AuthSession = {
  isAuthenticated: true,
  accessToken: "test-access-token",
  tokenType: "bearer",
  expiresIn: 3600,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    role: "user",
    avatarFallback: "DO",
  },
};

function createWrapper() {
  const queryClient = createOrbitQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AppProviders initialSession={demoSession} queryClient={queryClient}>
        {children}
      </AppProviders>
    );
  }

  return { Wrapper, queryClient };
}

function createTestTransportHarness() {
  const messageListeners = new Set<(message: Message) => void>();
  const typingListeners = new Set<(event: ChatTypingEvent) => void>();
  const connectionListeners = new Set<(status: ChatConnectionStatus) => void>();
  const joinedRooms: string[] = [];
  const leftRooms: string[] = [];
  const emittedTyping: ChatTypingEvent[] = [];

  const transport: ChatTransport = {
    connect() {
      connectionListeners.forEach((listener) => listener("connected"));
    },
    disconnect() {
      connectionListeners.forEach((listener) => listener("disconnected"));
    },
    joinRoom(channelId) {
      joinedRooms.push(channelId);
    },
    leaveRoom(channelId) {
      leftRooms.push(channelId);
    },
    sendMessage(message) {
      return new Promise((resolve) => {
        window.setTimeout(() => {
          resolve({
            clientMessageId: message.clientMessageId,
            message: {
              ...message,
              id: `srv_${message.clientMessageId}`,
              serverMessageId: `srv_${message.clientMessageId}`,
              status: "sent",
              canRetry: false,
            },
          });
        }, 200);
      });
    },
    emitTyping(event) {
      emittedTyping.push(event);
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

  return {
    transport,
    joinedRooms,
    leftRooms,
    emittedTyping,
    emitMessage(message: Message) {
      messageListeners.forEach((listener) => listener(message));
    },
    emitTypingEvent(event: ChatTypingEvent) {
      typingListeners.forEach((listener) => listener(event));
    },
    emitConnectionStatus(status: ChatConnectionStatus) {
      connectionListeners.forEach((listener) => listener(status));
    },
  };
}

describe("useChat realtime orchestration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("joins the active room and leaves the previous room when switching channels", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.activeChannelId).toBe("channel_general");
    expect(harness.joinedRooms).toContain("channel_general");

    act(() => {
      result.current.setActiveChannelId("dm_release_squad");
    });

    expect(harness.leftRooms).toContain("channel_general");
    expect(harness.joinedRooms).toContain("dm_release_squad");
  });

  it("adds optimistic messages and transitions them to sent", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setDraft("Transport-backed optimistic message");
    });

    act(() => {
      result.current.sendMessage();
    });

    expect(
      queryClient
        .getQueryData<Message[]>(orbitQueryKeys.chat.messages("channel_general"))
        ?.some(
        (message) =>
          message.content === "Transport-backed optimistic message" &&
          message.status === "sending",
      ),
    ).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(
      queryClient
        .getQueryData<Message[]>(orbitQueryKeys.chat.messages("channel_general"))
        ?.some(
        (message) =>
          message.content === "Transport-backed optimistic message" &&
          message.status === "sent",
      ),
    ).toBe(true);
  });

  it("appends incoming realtime messages once and prevents duplicates", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper, queryClient } = createWrapper();
    renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    const incomingMessage: Message = {
      id: "msg_incoming_test",
      clientMessageId: "incoming_test",
      serverMessageId: "srv_incoming_test",
      channelId: "channel_general",
      userId: "user_annie",
      username: "Annie Case",
      avatarFallback: "AC",
      content: "Incoming test transport message.",
      createdAt: "2026-04-03T09:40:00.000Z",
      type: "text",
      status: "sent",
    };

    act(() => {
      harness.emitMessage(incomingMessage);
      harness.emitMessage(incomingMessage);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      queryClient
        .getQueryData<Message[]>(orbitQueryKeys.chat.messages("channel_general"))
        ?.filter(
        (message) => message.content === "Incoming test transport message.",
      ),
    ).toHaveLength(1);
  });

  it("updates unread counts for off-channel messages and clears them when the channel opens", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      queryClient
        .getQueryData<{ id: string; unreadCount?: number }[]>(orbitQueryKeys.chat.conversations)
        ?.find((channel) => channel.id === "dm_release_squad")?.unreadCount,
    ).toBe(1);

    act(() => {
      harness.emitMessage({
        id: "msg_release_followup",
        clientMessageId: "incoming_release_followup",
        serverMessageId: "srv_release_followup",
        channelId: "dm_release_squad",
        userId: "user_annie",
        username: "Annie Case",
        avatarFallback: "AC",
        content: "Another Release Squad update.",
        createdAt: "2026-04-03T09:45:00.000Z",
        type: "text",
        status: "sent",
      });
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      queryClient
        .getQueryData<{ id: string; unreadCount?: number }[]>(orbitQueryKeys.chat.conversations)
        ?.find((channel) => channel.id === "dm_release_squad")?.unreadCount,
    ).toBe(2);

    act(() => {
      result.current.setActiveChannelId("dm_release_squad");
    });

    expect(
      queryClient
        .getQueryData<{ id: string; unreadCount?: number }[]>(orbitQueryKeys.chat.conversations)
        ?.find((channel) => channel.id === "dm_release_squad")?.unreadCount,
    ).toBe(0);
  });

  it("persists mute state through chat preferences without affecting message flow", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.toggleMuteChannel("dm_release_squad");
    });

    expect(readChatPreferences().mutedChannelIds).toContain("dm_release_squad");

    act(() => {
      harness.emitMessage({
        id: "msg_release_muted",
        clientMessageId: "incoming_release_muted",
        serverMessageId: "srv_release_muted",
        channelId: "dm_release_squad",
        userId: "user_annie",
        username: "Annie Case",
        avatarFallback: "AC",
        content: "Muted channel still receives messages.",
        createdAt: "2026-04-03T09:50:00.000Z",
        type: "text",
        status: "sent",
      });
    });

    expect(
      queryClient
        .getQueryData<{ id: string; unreadCount?: number }[]>(orbitQueryKeys.chat.conversations)
        ?.find((channel) => channel.id === "dm_release_squad")?.unreadCount,
    ).toBe(2);
  });

  it("exposes connection state updates from the transport", () => {
    const harness = createTestTransportHarness();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    expect(result.current.connectionStatus).toBe("connected");

    act(() => {
      harness.emitConnectionStatus("reconnecting");
    });

    expect(result.current.connectionStatus).toBe("reconnecting");
  });

  it("shows a typing indicator for the active channel", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    act(() => {
      harness.emitTypingEvent({
        channelId: "channel_general",
        userId: "user_annie",
        username: "Annie Case",
        isTyping: true,
      });
    });

    expect(result.current.typingLabel).toBe("Annie Case");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    expect(result.current.typingLabel).toBeNull();
  });

  it("tracks multiple typing users in the same channel and clears them independently", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    act(() => {
      harness.emitTypingEvent({
        channelId: "channel_general",
        userId: "user_annie",
        username: "Annie Case",
        isTyping: true,
      });
      harness.emitTypingEvent({
        channelId: "channel_general",
        userId: "user_eli",
        username: "Eli Turner",
        isTyping: true,
      });
    });

    expect(result.current.typingLabel).toBe("Annie Case, Eli Turner");

    act(() => {
      harness.emitTypingEvent({
        channelId: "channel_general",
        userId: "user_annie",
        username: "Annie Case",
        isTyping: false,
      });
    });

    expect(result.current.typingLabel).toBe("Eli Turner");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });

    expect(result.current.typingLabel).toBeNull();
  });

  it("marks mention messages and elevates unread mention state for off-channel updates", async () => {
    const harness = createTestTransportHarness();
    const { Wrapper, queryClient } = createWrapper();
    renderHook(() => useChat({ transport: harness.transport }), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      harness.emitMessage({
        id: "msg_release_mention",
        clientMessageId: "incoming_release_mention",
        serverMessageId: "srv_release_mention",
        channelId: "dm_release_squad",
        userId: "user_annie",
        username: "Annie Case",
        avatarFallback: "AC",
        content: "Heads up @demo-orbit, the release notes are ready.",
        createdAt: "2026-04-03T09:52:00.000Z",
        type: "text",
        status: "sent",
      });
    });

    expect(
      queryClient
        .getQueryData<{ id: string; unreadMentionCount?: number }[]>(orbitQueryKeys.chat.conversations)
        ?.find((channel) => channel.id === "dm_release_squad")?.unreadMentionCount,
    ).toBe(1);

    expect(
      queryClient
        .getQueryData<Message[]>(orbitQueryKeys.chat.messages("dm_release_squad"))
        ?.find((message) => message.id === "msg_release_mention")?.isMention,
    ).toBe(true);
  });
});
