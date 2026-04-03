import { useEffect, useMemo, useState } from "react";
import type { Channel, Member, Message } from "@/entities/message/model/types";
import { useAuth } from "@/features/auth/useAuth";
import type { ChatTransport } from "@/features/chat/transport/chatTransport";
import { createMockChatTransport } from "@/features/chat/transport/mockChatTransport";

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

interface UseChatResult {
  channels: Channel[];
  activeChannelId: string;
  setActiveChannelId: (channelId: string) => void;
  activeChannel: Channel | undefined;
  messages: Message[];
  members: Member[];
  sendMessage: () => void;
  draft: string;
  setDraft: (draft: string) => void;
  isEmpty: boolean;
}

interface UseChatOptions {
  transport?: ChatTransport;
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const { user } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState<string>("channel_general");
  const [draft, setDraft] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>(mockMessages);
  const transport = useMemo(
    () => options.transport ?? createMockChatTransport(),
    [options.transport],
  );

  const activeChannel = useMemo(
    () => mockChannels.find((channel) => channel.id === activeChannelId),
    [activeChannelId],
  );

  const messages = useMemo(
    () => allMessages.filter((message) => message.channelId === activeChannelId),
    [activeChannelId, allMessages],
  );

  useEffect(() => {
    transport.subscribeToMessages((incomingMessage) => {
      setAllMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === incomingMessage.id)) {
          return currentMessages;
        }

        return [...currentMessages, incomingMessage];
      });
    });

    return () => {
      transport.unsubscribe();
    };
  }, [transport]);

  function sendMessage() {
    const content = draft.trim();

    if (!content || !activeChannel || !user) {
      return;
    }

    const nextMessage: Message = {
      id: `msg_${activeChannel.id}_${Date.now()}`,
      channelId: activeChannel.id,
      userId: user.id,
      username: user.name,
      avatarFallback: user.avatarFallback,
      content,
      createdAt: new Date().toISOString(),
      type: "text",
      status: "sending",
    };

    setAllMessages((currentMessages) => [...currentMessages, nextMessage]);
    setDraft("");

    void transport
      .sendMessage(nextMessage)
      .then((sentMessage) => {
        setAllMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === nextMessage.id ? { ...message, ...sentMessage, status: "sent" } : message,
          ),
        );
      })
      .catch(() => {
        setAllMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === nextMessage.id ? { ...message, status: "failed" } : message,
          ),
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
    sendMessage,
    draft,
    setDraft,
    isEmpty: messages.length === 0,
  };
}
