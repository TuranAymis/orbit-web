import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AppProviders } from "@/app/providers/AppProviders";
import { useChat } from "@/features/chat/model/useChat";
import type { AuthSession } from "@/features/auth/types";
import type { Message } from "@/entities/message/model/types";
import type { ChatTransport } from "@/features/chat/transport/chatTransport";

const demoSession: AuthSession = {
  isAuthenticated: true,
  user: {
    id: "user_demo_orbit",
    name: "Demo Orbit",
    email: "demo@orbit.dev",
    membershipTier: "Core",
    avatarFallback: "DO",
  },
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AppProviders initialSession={demoSession}>{children}</AppProviders>;
}

function createTestTransport(): ChatTransport {
  let listener: ((message: Message) => void) | null = null;

  return {
    sendMessage(message) {
      return new Promise((resolve) => {
        window.setTimeout(() => {
          resolve({ ...message, status: "sent" });
        }, 200);
      });
    },
    subscribeToMessages(callback) {
      listener = callback;
      window.setTimeout(() => {
        listener?.({
          id: "msg_incoming_test",
          channelId: "channel_general",
          userId: "user_annie",
          username: "Annie Case",
          avatarFallback: "AC",
          content: "Incoming test transport message.",
          createdAt: "2026-04-03T09:40:00.000Z",
          type: "text",
          status: "sent",
        });
      }, 400);
    },
    unsubscribe() {
      listener = null;
    },
  };
}

describe("useChat transport integration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("adds optimistic messages and transitions them to sent", async () => {
    const { result } = renderHook(() => useChat({ transport: createTestTransport() }), {
      wrapper,
    });

    act(() => {
      result.current.setDraft("Transport-backed optimistic message");
    });

    act(() => {
      result.current.sendMessage();
    });

    expect(
      result.current.messages.some(
        (message) =>
          message.content === "Transport-backed optimistic message" &&
          message.status === "sending",
      ),
    ).toBe(true);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(
      result.current.messages.some(
        (message) =>
          message.content === "Transport-backed optimistic message" &&
          message.status === "sent",
      ),
    ).toBe(true);
  });

  it("appends incoming messages from the transport subscription", async () => {
    const { result } = renderHook(() => useChat({ transport: createTestTransport() }), {
      wrapper,
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(
      result.current.messages.some(
        (message) => message.content === "Incoming test transport message.",
      ),
    ).toBe(true);
  });
});
