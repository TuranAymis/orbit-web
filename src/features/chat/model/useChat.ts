import { useEffect, useMemo, useState } from "react";
import type { Channel, Member, Message } from "@/entities/message/model/types";
import { orbitRuntimeConfig } from "@/config/env";
import { useAuth } from "@/features/auth/useAuth";
import type {
  ChatConnectionStatus,
  ChatTransport,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";
import { createMockChatTransport } from "@/features/chat/transport/mockChatTransport";
import { createSocketChatTransport } from "@/features/chat/transport/socketChatTransport";

const mockChannels: Channel[] = [
  { id: "channel_general", name: "general", kind: "channel", unreadCount: 2 },
  { id: "channel_product", name: "product-lab", kind: "channel" },
  { id: "channel_support", name: "support-desk", kind: "channel" },
  { id: "dm_release_squad", name: "Release Squad", kind: "dm", unreadCount: 1 },
  { id: "dm_annie_case", name: "Annie Case", kind: "dm" },
];

const mockMembers: Member[] = [
  { id: "user_demo_orbit", name: "Demo Orbit", avatarFallback: "DO", status: "online", role: "Host" },
  { id: "user_annie", name: "Annie Case", avatarFallback: "AC", status: "online", role: "Moderator" },
  { id: "user_eli", name: "Eli Turner", avatarFallback: "ET", status: "away", role: "Engineer" },
  { id: "user_june", name: "June Park", avatarFallback: "JP", status: "offline", role: "Designer" },
  { id: "user_marc", name: "Marc Ellis", avatarFallback: "ME", status: "offline", role: "Support" },
];

const mockMessages: Message[] = [
  {
    id: "msg_general_1",
    clientMessageId: "seed_general_1",
    serverMessageId: "msg_general_1",
    channelId: "channel_general",
    userId: "user_annie",
    username: "Annie Case",
    avatarFallback: "AC",
    content: "Deploy preview is ready for QA. Can someone give the new layout pass a quick check?",
    createdAt: "2026-04-03T09:12:00.000Z",
    type: "text",
    status: "sent",
  },
  {
    id: "msg_general_2",
    clientMessageId: "seed_general_2",
    serverMessageId: "msg_general_2",
    channelId: "channel_general",
    userId: "system",
    username: "Orbit System",
    avatarFallback: "OS",
    content: "Demo Orbit joined #general.",
    createdAt: "2026-04-03T09:15:00.000Z",
    type: "system",
    status: "sent",
  },
  {
    id: "msg_general_3",
    clientMessageId: "seed_general_3",
    serverMessageId: "msg_general_3",
    channelId: "channel_general",
    userId: "user_eli",
    username: "Eli Turner",
    avatarFallback: "ET",
    content: "I can take the mobile sidebar sweep after standup.",
    createdAt: "2026-04-03T09:18:00.000Z",
    type: "text",
    status: "sent",
  },
  {
    id: "msg_product_1",
    clientMessageId: "seed_product_1",
    serverMessageId: "msg_product_1",
    channelId: "channel_product",
    userId: "user_demo_orbit",
    username: "Demo Orbit",
    avatarFallback: "DO",
    content: "Let’s keep the onboarding release notes focused on value props and first actions.",
    createdAt: "2026-04-03T08:58:00.000Z",
    type: "text",
    status: "sent",
  },
  {
    id: "msg_release_1",
    clientMessageId: "seed_release_1",
    serverMessageId: "msg_release_1",
    channelId: "dm_release_squad",
    userId: "user_annie",
    username: "Annie Case",
    avatarFallback: "AC",
    content: "Release notes draft is ready for review. I’ve grouped the changes by user impact.",
    createdAt: "2026-04-03T09:08:00.000Z",
    type: "text",
    status: "sent",
  },
  {
    id: "msg_annie_1",
    clientMessageId: "seed_annie_1",
    serverMessageId: "msg_annie_1",
    channelId: "dm_annie_case",
    userId: "user_annie",
    username: "Annie Case",
    avatarFallback: "AC",
    content: "Could you sanity-check the empty states before we record the demo?",
    createdAt: "2026-04-03T08:42:00.000Z",
    type: "text",
    status: "sent",
  },
];

type MessagesByChannel = Record<string, Message[]>;

function createInitialMessagesByChannel(messages: Message[]): MessagesByChannel {
  return messages.reduce<MessagesByChannel>((accumulator, message) => {
    accumulator[message.channelId] = [...(accumulator[message.channelId] ?? []), message];
    return accumulator;
  }, {});
}

function appendMessage(
  messageMap: MessagesByChannel,
  message: Message,
): MessagesByChannel {
  const channelMessages = messageMap[message.channelId] ?? [];

  if (
    channelMessages.some(
      (existingMessage) =>
        existingMessage.clientMessageId === message.clientMessageId ||
        (message.serverMessageId &&
          existingMessage.serverMessageId === message.serverMessageId),
    )
  ) {
    return messageMap;
  }

  return {
    ...messageMap,
    [message.channelId]: [...channelMessages, message],
  };
}

function reconcileMessage(
  messageMap: MessagesByChannel,
  clientMessageId: string,
  updater: (message: Message) => Message,
): MessagesByChannel {
  const nextEntries = Object.entries(messageMap).map(([channelId, messages]) => [
    channelId,
    messages.map((message) =>
      message.clientMessageId === clientMessageId ? updater(message) : message,
    ),
  ]);

  return Object.fromEntries(nextEntries);
}

interface UseChatResult {
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (channelId: string) => void;
  activeChannel: Channel | undefined;
  messages: Message[];
  members: Member[];
  connectionStatus: ChatConnectionStatus;
  sendMessage: () => void;
  draft: string;
  setDraft: (draft: string) => void;
  isEmpty: boolean;
}

interface UseChatOptions {
  transport?: ChatTransport;
}

function createDefaultChatTransport() {
  if (orbitRuntimeConfig.chatTransportMode === "mock") {
    return createMockChatTransport();
  }

  return createSocketChatTransport({
    url: orbitRuntimeConfig.chatSocketUrl,
    path: orbitRuntimeConfig.chatSocketPath,
    namespace: orbitRuntimeConfig.chatSocketNamespace,
    sendEvent: orbitRuntimeConfig.chatSendEvent,
    messageEvent: orbitRuntimeConfig.chatMessageEvent,
    ackTimeoutMs: orbitRuntimeConfig.chatAckTimeoutMs,
  });
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const { user } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState<string>("channel_general");
  const [draft, setDraft] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ChatConnectionStatus>("disconnected");
  const [messagesByChannel, setMessagesByChannel] = useState<MessagesByChannel>(() =>
    createInitialMessagesByChannel(mockMessages),
  );
  const transport = useMemo(
    () => options.transport ?? createDefaultChatTransport(),
    [options.transport],
  );

  const activeChannel = useMemo(
    () => mockChannels.find((channel) => channel.id === activeChannelId),
    [activeChannelId],
  );

  const messages = useMemo(
    () => messagesByChannel[activeChannelId] ?? [],
    [activeChannelId, messagesByChannel],
  );

  useEffect(() => {
    const unsubscribeConnection = transport.subscribeToConnectionStatus(
      setConnectionStatus,
    );
    const unsubscribe = transport.subscribeToMessages((incomingMessage) => {
      setMessagesByChannel((currentMessages) =>
        appendMessage(currentMessages, incomingMessage),
      );
    });
    transport.connect();

    return () => {
      unsubscribeConnection();
      unsubscribe();
      transport.disconnect();
    };
  }, [transport]);

  function sendMessage() {
    const content = draft.trim();

    if (!content || !activeChannel || !user) {
      return;
    }

    const clientMessageId = `client_${activeChannel.id}_${Date.now()}`;
    const nextMessage: Message = {
      id: clientMessageId,
      clientMessageId,
      channelId: activeChannel.id,
      userId: user.id,
      username: user.name,
      avatarFallback: user.avatarFallback,
      content,
      createdAt: new Date().toISOString(),
      type: "text",
      status: "sending",
      canRetry: false,
    };
    const outgoingMessage: TransportOutgoingMessage = {
      clientMessageId,
      channelId: nextMessage.channelId,
      userId: nextMessage.userId,
      username: nextMessage.username,
      avatarFallback: nextMessage.avatarFallback,
      content: nextMessage.content,
      createdAt: nextMessage.createdAt,
      type: nextMessage.type,
    };

    setMessagesByChannel((currentMessages) =>
      appendMessage(currentMessages, nextMessage),
    );
    setDraft("");

    void transport
      .sendMessage(outgoingMessage)
      .then(({ clientMessageId: acknowledgedClientId, message: sentMessage }) => {
        setMessagesByChannel((currentMessages) =>
          reconcileMessage(currentMessages, acknowledgedClientId, () => ({
            ...sentMessage,
            status: "sent",
            canRetry: false,
          })),
        );
      })
      .catch(() => {
        setMessagesByChannel((currentMessages) =>
          reconcileMessage(currentMessages, nextMessage.clientMessageId, (message) => ({
            ...message,
            status: "failed",
            canRetry: true,
          })),
        );
      });
  }

  return {
    channels: mockChannels,
    activeChannelId,
    setActiveChannelId,
    activeChannel,
    messages,
    members: mockMembers,
    connectionStatus,
    sendMessage,
    draft,
    setDraft,
    isEmpty: messages.length === 0,
  };
}
