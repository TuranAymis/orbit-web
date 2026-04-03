import type { Message } from "@/entities/message/model/types";
import type { ChatTransport } from "@/features/chat/transport/chatTransport";

interface MockChatTransportOptions {
  outgoingDelayMs?: number;
  incomingDelayMs?: number;
}

const incomingMessages: Message[] = [
  {
    id: "msg_incoming_general_1",
    clientMessageId: "incoming_general_1",
    serverMessageId: "srv_incoming_general_1",
    channelId: "channel_general",
    userId: "user_annie",
    username: "Annie Case",
    avatarFallback: "AC",
    content: "I’m dropping updated feedback on the sidebar spacing in a minute.",
    createdAt: "2026-04-03T09:24:00.000Z",
    type: "text",
    status: "sent",
  },
];

export function createMockChatTransport(
  options: MockChatTransportOptions = {},
): ChatTransport {
  const outgoingDelayMs = options.outgoingDelayMs ?? 320;
  const incomingDelayMs = options.incomingDelayMs ?? 1800;
  const listeners = new Set<(message: Message) => void>();
  let incomingTimer: number | null = null;

  function ensureIncomingSimulation() {
    if (incomingTimer !== null || listeners.size === 0) {
      return;
    }

    incomingTimer = window.setTimeout(() => {
      incomingMessages.forEach((message) => {
        listeners.forEach((listener) => listener(message));
      });
      incomingTimer = null;
    }, incomingDelayMs);
  }

  return {
    async sendMessage(message) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, outgoingDelayMs);
      });

      return {
        clientMessageId: message.clientMessageId,
        message: {
          ...message,
          id: `srv_${message.clientMessageId}`,
          serverMessageId: `srv_${message.clientMessageId}`,
          status: "sent",
          canRetry: false,
        },
      };
    },
    subscribeToMessages(callback) {
      listeners.add(callback);
      ensureIncomingSimulation();

      return () => {
        listeners.delete(callback);

        if (listeners.size === 0 && incomingTimer !== null) {
          window.clearTimeout(incomingTimer);
          incomingTimer = null;
        }
      };
    },
  };
}
