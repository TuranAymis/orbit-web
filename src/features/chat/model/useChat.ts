import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Channel, Member, Message } from "@/entities/message/model/types";
import { appConfig } from "@/config/appConfig";
import { useAuth } from "@/features/auth/useAuth";
import type {
  ChatConnectionStatus,
  ChatTransport,
  ChatTypingEvent,
  TransportOutgoingMessage,
} from "@/features/chat/transport/chatTransport";
import { createHttpChatTransport } from "@/features/chat/transport/httpChatTransport";
import {
  defaultChatPreferences,
  readChatPreferences,
  updateChatPreferences,
  type ChatPreferences,
} from "@/features/chat/model/chatPreferences";
import { createMockChatTransport } from "@/features/chat/transport/mockChatTransport";
import { withMentionStateForIdentity } from "@/features/chat/model/mentions";
import { createSocketChatTransport } from "@/features/chat/transport/socketChatTransport";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";
import { httpClient } from "@/shared/lib/http/httpClient";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

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

interface BackendChatResponse {
  id: string;
  sender_id: string;
  group_id?: string | null;
  event_id?: string | null;
  message: string;
  created_at: string;
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
  typingLabel: string | null;
  toggleMuteChannel: (channelId: string) => void;
  isActiveChannelMuted: boolean;
  readStateLabel: string;
}

interface UseChatOptions {
  transport?: ChatTransport;
  preferredChannelId?: string | null;
}

function getMessageIdentity(message: Pick<Message, "id" | "clientMessageId" | "serverMessageId">) {
  return message.serverMessageId ?? message.id ?? message.clientMessageId;
}

function appendMessage(messages: Message[], message: Message): Message[] {
  const incomingIdentity = getMessageIdentity(message);

  if (
    messages.some(
      (existingMessage) =>
        getMessageIdentity(existingMessage) === incomingIdentity ||
        existingMessage.id === message.id ||
        existingMessage.clientMessageId === message.clientMessageId ||
        (message.serverMessageId &&
          existingMessage.serverMessageId === message.serverMessageId),
    )
  ) {
    return messages;
  }

  return [...messages, message];
}

function reconcileMessage(
  messages: Message[],
  clientMessageId: string,
  updater: (message: Message) => Message,
): Message[] {
  return messages.map((message) =>
    message.clientMessageId === clientMessageId ? updater(message) : message,
  );
}

function setConversationUnread(
  conversations: Channel[],
  channelId: string,
  updater: (currentChannel: Channel) => Partial<Channel>,
) {
  return conversations.map((channel) =>
    channel.id === channelId
      ? {
          ...channel,
          ...updater(channel),
        }
      : channel,
  );
}

function syncChatUnreadCount(queryClient: ReturnType<typeof useQueryClient>, conversations: Channel[]) {
  queryClient.setQueryData(
    orbitQueryKeys.chat.unreadCount,
    conversations.reduce((total, channel) => total + (channel.unreadCount ?? 0), 0),
  );
}

function mapBackendMessages(
  payload: BackendChatResponse[],
  channelId: string,
  currentUser?: {
    id: string;
    name: string;
    avatarFallback: string;
  } | null,
): Message[] {
  return payload
    .map<Message>((message) => ({
      id: message.id,
      clientMessageId: message.id,
      serverMessageId: message.id,
      channelId: message.group_id ?? message.event_id ?? channelId,
      userId: message.sender_id,
      username:
        message.sender_id === currentUser?.id ? currentUser.name : "Orbit Member",
      avatarFallback:
        message.sender_id === currentUser?.id ? currentUser.avatarFallback : "OM",
      content: message.message,
      createdAt: message.created_at,
      type: "text",
      status: "sent",
      canRetry: false,
    }))
    .map((message) => withMentionStateForIdentity(message, currentUser));
}

function createDefaultChatTransport(accessToken?: string) {
  if (appConfig.chatTransportMode === "mock") {
    return createMockChatTransport();
  }

  if (appConfig.chatTransportMode === "http") {
    return createHttpChatTransport();
  }

  return createSocketChatTransport({
    url: appConfig.socketUrl,
    path: appConfig.chatSocketPath,
    namespace: appConfig.chatSocketNamespace,
    authToken: accessToken,
    sendEvent: appConfig.chatSendEvent,
    messageEvent: appConfig.chatMessageEvent,
    joinRoomEvent: appConfig.chatJoinRoomEvent,
    leaveRoomEvent: appConfig.chatLeaveRoomEvent,
    typingEvent: appConfig.chatTypingEvent,
    typingStartEvent: appConfig.chatTypingStartEvent,
    typingStopEvent: appConfig.chatTypingStopEvent,
    ackTimeoutMs: appConfig.chatAckTimeoutMs,
  });
}

export function useChat(options: UseChatOptions = {}): UseChatResult {
  const { user, session } = useAuth();
  const queryClient = useQueryClient();
  const isExternalTransport = Boolean(options.transport);
  const usesSeedData = isExternalTransport || appConfig.chatTransportMode === "mock";
  const [activeChannelId, setActiveChannelId] = useState<string>(
    options.preferredChannelId ?? (usesSeedData ? "channel_general" : ""),
  );
  const [draft, setDraft] = useState("");
  const [connectionStatus, setConnectionStatus] =
    useState<ChatConnectionStatus>("disconnected");
  const [typingUsersByChannel, setTypingUsersByChannel] = useState<
    Record<string, Record<string, string>>
  >({});
  const transport = useMemo(
    () => options.transport ?? createDefaultChatTransport(session?.accessToken),
    [options.transport, session?.accessToken],
  );
  const activeChannelIdRef = useRef(activeChannelId);
  const previousChannelIdRef = useRef<string | null>(null);
  const typingTimeoutsRef = useRef<Record<string, Record<string, number>>>({});
  const outgoingTypingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const connectionStatusRef = useRef<ChatConnectionStatus>("disconnected");
  activeChannelIdRef.current = activeChannelId;
  const chatPreferencesQuery = useQuery({
    queryKey: orbitQueryKeys.chat.preferences,
    queryFn: async () => readChatPreferences(),
    initialData: defaultChatPreferences,
    staleTime: Number.POSITIVE_INFINITY,
  });
  const chatPreferences = chatPreferencesQuery.data ?? defaultChatPreferences;

  const conversationsQuery = useQuery({
    queryKey: orbitQueryKeys.chat.conversations,
    queryFn: async () => {
      if (usesSeedData) {
        return mockChannels;
      }

      const groupList = await listGroups();
      return groupList.map<Channel>((group) => ({
        id: group.id,
        name: group.name.toLowerCase().replace(/\s+/g, "-"),
        kind: "channel",
      }));
    },
    initialData: usesSeedData ? mockChannels : [],
    staleTime: 30_000,
  });

  const channels = useMemo(
    () =>
      (conversationsQuery.data ?? []).map((channel) => ({
        ...channel,
        isMuted: chatPreferences.mutedChannelIds.includes(channel.id),
        lastReadAt: chatPreferences.lastReadAtByChannel[channel.id],
      })),
    [chatPreferences.lastReadAtByChannel, chatPreferences.mutedChannelIds, conversationsQuery.data],
  );

  const activeChannel = useMemo(
    () => channels.find((channel) => channel.id === activeChannelId),
    [activeChannelId, channels],
  );

  const messagesQuery = useQuery({
    queryKey: activeChannelId
      ? orbitQueryKeys.chat.messages(activeChannelId)
      : orbitQueryKeys.chat.messages("empty"),
    enabled: Boolean(activeChannelId),
    queryFn: async () => {
      if (!activeChannelId) {
        return [];
      }

      if (usesSeedData) {
        return mockMessages.filter((message) => message.channelId === activeChannelId);
      }

      const payload = await httpClient.get<BackendChatResponse[]>(
        `/chats?group_id=${encodeURIComponent(activeChannelId)}`,
      );

      return mapBackendMessages(payload, activeChannelId, user);
    },
    initialData:
      usesSeedData && activeChannelId
        ? mockMessages.filter((message) => message.channelId === activeChannelId)
        : [],
    staleTime: 15_000,
  });

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    if (
      options.preferredChannelId &&
      channels.some((channel) => channel.id === options.preferredChannelId)
    ) {
      setActiveChannelId(options.preferredChannelId);
      return;
    }

    setActiveChannelId((currentChannelId) => {
      if (currentChannelId && channels.some((channel) => channel.id === currentChannelId)) {
        return currentChannelId;
      }

      return channels[0]?.id ?? "";
    });
  }, [channels, options.preferredChannelId]);

  useEffect(() => {
    syncChatUnreadCount(queryClient, channels);
  }, [channels, queryClient]);

  useEffect(() => {
    const unsubscribeConnection = transport.subscribeToConnectionStatus(
      (status) => {
        const previousStatus = connectionStatusRef.current;
        connectionStatusRef.current = status;
        setConnectionStatus(status);

        if (
          !usesSeedData &&
          status === "connected" &&
          previousStatus !== "connected" &&
          activeChannelIdRef.current
        ) {
          void queryClient.invalidateQueries({
            queryKey: orbitQueryKeys.chat.messages(activeChannelIdRef.current),
          });
        }
      },
    );
    const unsubscribeMessages = transport.subscribeToMessages((incomingMessage) => {
      queryClient.setQueryData<Message[]>(
        orbitQueryKeys.chat.messages(incomingMessage.channelId),
        (currentMessages = []) =>
          appendMessage(currentMessages, withMentionStateForIdentity(incomingMessage, user)),
      );

      const incomingMessageWithMention = withMentionStateForIdentity(incomingMessage, user);

      if (incomingMessage.channelId !== activeChannelIdRef.current) {
      queryClient.setQueryData<Channel[]>(
        orbitQueryKeys.chat.conversations,
        (currentChannels = []) => {
          const nextChannels = setConversationUnread(
            currentChannels,
              incomingMessage.channelId,
              (currentChannel) => ({
                unreadCount: (currentChannel.unreadCount ?? 0) + 1,
                unreadMentionCount:
                  (currentChannel.unreadMentionCount ?? 0) +
                  (incomingMessageWithMention.isMention ? 1 : 0),
              }),
            );
            syncChatUnreadCount(queryClient, nextChannels);
            return nextChannels;
          },
        );
        return;
      }

        queryClient.setQueryData<Channel[]>(
        orbitQueryKeys.chat.conversations,
        (currentChannels = []) => {
          const nextChannels = setConversationUnread(
            currentChannels,
            incomingMessage.channelId,
            () => ({
              unreadCount: 0,
              unreadMentionCount: 0,
            }),
          );
          syncChatUnreadCount(queryClient, nextChannels);
          return nextChannels;
        },
      );

      const nextPreferences = updateChatPreferences((currentPreferences) => ({
        ...currentPreferences,
        lastReadAtByChannel: {
          ...currentPreferences.lastReadAtByChannel,
          [incomingMessage.channelId]: incomingMessage.createdAt,
        },
      }));
      queryClient.setQueryData<ChatPreferences>(
        orbitQueryKeys.chat.preferences,
        nextPreferences,
      );
    });
    const unsubscribeTyping = transport.subscribeToTyping((event) => {
      if (event.userId === user?.id) {
        return;
      }

      const currentChannelTimeouts = typingTimeoutsRef.current[event.channelId] ?? {};
      const currentTimeout = currentChannelTimeouts[event.userId];
      if (currentTimeout) {
        window.clearTimeout(currentTimeout);
      }

      if (!event.isTyping) {
        if (typingTimeoutsRef.current[event.channelId]) {
          delete typingTimeoutsRef.current[event.channelId][event.userId];
        }

        setTypingUsersByChannel((currentTyping) => {
          const nextTyping = { ...currentTyping };
          const nextChannelTyping = { ...(nextTyping[event.channelId] ?? {}) };
          delete nextChannelTyping[event.userId];

          if (Object.keys(nextChannelTyping).length === 0) {
            delete nextTyping[event.channelId];
          } else {
            nextTyping[event.channelId] = nextChannelTyping;
          }

          return nextTyping;
        });
        return;
      }

      setTypingUsersByChannel((currentTyping) => ({
        ...currentTyping,
        [event.channelId]: {
          ...(currentTyping[event.channelId] ?? {}),
          [event.userId]: event.username,
        },
      }));

      typingTimeoutsRef.current[event.channelId] = {
        ...currentChannelTimeouts,
        [event.userId]: window.setTimeout(() => {
          setTypingUsersByChannel((currentTyping) => {
            const nextTyping = { ...currentTyping };
            const nextChannelTyping = { ...(nextTyping[event.channelId] ?? {}) };
            delete nextChannelTyping[event.userId];

            if (Object.keys(nextChannelTyping).length === 0) {
              delete nextTyping[event.channelId];
            } else {
              nextTyping[event.channelId] = nextChannelTyping;
            }

            return nextTyping;
          });
          if (typingTimeoutsRef.current[event.channelId]) {
            delete typingTimeoutsRef.current[event.channelId][event.userId];
          }
        }, 2000),
      };
    });

    transport.connect();

    return () => {
      Object.values(typingTimeoutsRef.current).forEach((channelTimeouts) => {
        Object.values(channelTimeouts).forEach((timeoutId) => {
          window.clearTimeout(timeoutId);
        });
      });
      typingTimeoutsRef.current = {};
      unsubscribeConnection();
      unsubscribeMessages();
      unsubscribeTyping();
      transport.disconnect();
    };
  }, [queryClient, transport, user?.id]);

  useEffect(() => {
    const previousChannelId = previousChannelIdRef.current;

    if (previousChannelId && previousChannelId !== activeChannelId) {
      transport.leaveRoom(previousChannelId);
    }

    if (activeChannelId) {
      transport.joinRoom(activeChannelId);
    }

    previousChannelIdRef.current = activeChannelId || null;
  }, [activeChannelId, transport]);

  useEffect(() => {
    if (!activeChannelId) {
      return;
    }

    queryClient.setQueryData<Channel[]>(
      orbitQueryKeys.chat.conversations,
      (currentChannels = []) => {
        const nextChannels = setConversationUnread(currentChannels, activeChannelId, () => ({
          unreadCount: 0,
          unreadMentionCount: 0,
        }));
        syncChatUnreadCount(queryClient, nextChannels);
        return nextChannels;
      },
    );

    const latestMessage = queryClient
      .getQueryData<Message[]>(orbitQueryKeys.chat.messages(activeChannelId))
      ?.at(-1);

    const nextPreferences = updateChatPreferences((currentPreferences) => ({
      ...currentPreferences,
      lastReadAtByChannel: {
        ...currentPreferences.lastReadAtByChannel,
        [activeChannelId]: latestMessage?.createdAt ?? new Date().toISOString(),
      },
    }));
    queryClient.setQueryData<ChatPreferences>(
      orbitQueryKeys.chat.preferences,
      nextPreferences,
    );
  }, [activeChannelId, queryClient]);

  useEffect(() => {
    if (!user || !activeChannelId || usesSeedData) {
      return;
    }

    const content = draft.trim();

    if (!content) {
      if (isTypingRef.current) {
        transport.emitTyping({
          channelId: activeChannelId,
          userId: user.id,
          username: user.name,
          isTyping: false,
        });
        isTypingRef.current = false;
      }

      return;
    }

    if (!isTypingRef.current) {
      transport.emitTyping({
        channelId: activeChannelId,
        userId: user.id,
        username: user.name,
        isTyping: true,
      });
      isTypingRef.current = true;
    }

    if (outgoingTypingTimeoutRef.current) {
      window.clearTimeout(outgoingTypingTimeoutRef.current);
    }

    outgoingTypingTimeoutRef.current = window.setTimeout(() => {
      transport.emitTyping({
        channelId: activeChannelId,
        userId: user.id,
        username: user.name,
        isTyping: false,
      });
      isTypingRef.current = false;
    }, 1200);

    return () => {
      if (outgoingTypingTimeoutRef.current) {
        window.clearTimeout(outgoingTypingTimeoutRef.current);
      }
    };
  }, [activeChannelId, draft, transport, user, usesSeedData]);

  const members = useMemo<Member[]>(() => {
    if (usesSeedData) {
      return mockMembers;
    }

    const byUserId = new Map<string, Member>();

    if (user) {
      byUserId.set(user.id, {
        id: user.id,
        name: user.name,
        avatarFallback: user.avatarFallback,
        status: "online",
        role: "Member",
      });
    }

    messages.forEach((message) => {
      if (!byUserId.has(message.userId)) {
        byUserId.set(message.userId, {
          id: message.userId,
          name: message.username,
          avatarFallback: message.avatarFallback,
          status: "offline",
          role: "Member",
        });
      }
    });

    return [...byUserId.values()];
  }, [messages, user, usesSeedData]);

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

    if (isTypingRef.current) {
      transport.emitTyping({
        channelId: activeChannel.id,
        userId: user.id,
        username: user.name,
        isTyping: false,
      });
      isTypingRef.current = false;
    }

    queryClient.setQueryData<Message[]>(
      orbitQueryKeys.chat.messages(activeChannel.id),
      (currentMessages = []) =>
        appendMessage(currentMessages, withMentionStateForIdentity(nextMessage, user)),
    );
    const nextPreferences = updateChatPreferences((currentPreferences) => ({
      ...currentPreferences,
      lastReadAtByChannel: {
        ...currentPreferences.lastReadAtByChannel,
        [activeChannel.id]: nextMessage.createdAt,
      },
    }));
    queryClient.setQueryData<ChatPreferences>(
      orbitQueryKeys.chat.preferences,
      nextPreferences,
    );
    setDraft("");

    void transport
      .sendMessage(outgoingMessage)
      .then(({ clientMessageId: acknowledgedClientId, message: sentMessage }) => {
        queryClient.setQueryData<Message[]>(
          orbitQueryKeys.chat.messages(activeChannel.id),
          (currentMessages = []) =>
            reconcileMessage(currentMessages, acknowledgedClientId, () => ({
              ...withMentionStateForIdentity(sentMessage, user),
              status: "sent",
              canRetry: false,
            })),
        );
      })
      .catch(() => {
        queryClient.setQueryData<Message[]>(
          orbitQueryKeys.chat.messages(activeChannel.id),
          (currentMessages = []) =>
            reconcileMessage(currentMessages, nextMessage.clientMessageId, (message) => ({
              ...message,
              status: "failed",
              canRetry: true,
            })),
        );
      });
  }

  function handleSetActiveChannelId(channelId: string) {
    setActiveChannelId(channelId);
  }

  function toggleMuteChannel(channelId: string) {
    const nextPreferences = updateChatPreferences((currentPreferences) => {
      const isMuted = currentPreferences.mutedChannelIds.includes(channelId);

      return {
        ...currentPreferences,
        mutedChannelIds: isMuted
          ? currentPreferences.mutedChannelIds.filter((id) => id !== channelId)
          : [...currentPreferences.mutedChannelIds, channelId],
      };
    });

    queryClient.setQueryData<ChatPreferences>(
      orbitQueryKeys.chat.preferences,
      nextPreferences,
    );
    queryClient.setQueryData<Channel[]>(
      orbitQueryKeys.chat.conversations,
      (currentChannels = []) =>
        currentChannels.map((channel) =>
          channel.id === channelId
            ? {
                ...channel,
                isMuted: nextPreferences.mutedChannelIds.includes(channelId),
              }
            : channel,
        ),
    );
  }

  const activeChannelUnreadCount =
    channels.find((channel) => channel.id === activeChannelId)?.unreadCount ?? 0;
  const activeChannelLastReadAt =
    channels.find((channel) => channel.id === activeChannelId)?.lastReadAt ?? null;

  return {
    channels,
    activeChannelId,
    setActiveChannelId: handleSetActiveChannelId,
    activeChannel,
    messages,
    members,
    connectionStatus,
    sendMessage,
    draft,
    setDraft,
    isEmpty: messages.length === 0,
    typingLabel:
      Object.values(typingUsersByChannel[activeChannelId] ?? {}).length > 0
        ? Object.values(typingUsersByChannel[activeChannelId] ?? {}).join(", ")
        : null,
    toggleMuteChannel,
    isActiveChannelMuted:
      channels.find((channel) => channel.id === activeChannelId)?.isMuted ?? false,
    readStateLabel:
      activeChannelUnreadCount > 0
        ? "Unread"
        : activeChannelLastReadAt
          ? `Read ${new Date(activeChannelLastReadAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "All caught up",
  };
}
