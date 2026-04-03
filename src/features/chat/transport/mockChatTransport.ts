import type { Message } from "@/entities/message/model/types";
import type { ChatTransport } from "@/features/chat/transport/chatTransport";

interface MockChatTransportOptions {
  outgoingDelayMs?: number;
  incomingDelayMs?: number;
}

const incomingMessages: Message[] = [
  {
    id: "msg_incoming_general_1",
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
  let listener: ((message: Message) => void) | null = null;
  let incomingTimer: number | null = null;

  return {
    async sendMessage(message) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, outgoingDelayMs);
      });

      return {
        ...message,
        status: "sent",
      };
    },
    subscribeToMessages(callback) {
      listener = callback;

      if (incomingTimer !== null) {
        window.clearTimeout(incomingTimer);
      }

      incomingTimer = window.setTimeout(() => {
        if (listener) {
          listener(incomingMessages[0]);
        }
      }, incomingDelayMs);
    },
    unsubscribe() {
      listener = null;

      if (incomingTimer !== null) {
        window.clearTimeout(incomingTimer);
        incomingTimer = null;
      }
    },
  };
}
