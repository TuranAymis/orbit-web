export const orbitQueryKeys = {
  groups: {
    root: ["groups"] as const,
    list: ["groups"] as const,
    all: ["groups"] as const,
    detail: (groupId: string) => ["groups", "detail", groupId] as const,
    joinedState: ["groups", "joined-state"] as const,
  },
  events: {
    root: ["events"] as const,
    list: ["events"] as const,
    all: ["events"] as const,
    detail: (eventId: string) => ["events", "detail", eventId] as const,
  },
  discover: {
    all: ["discover"] as const,
    feed: ["discover", "feed"] as const,
  },
  notifications: {
    root: ["notifications"] as const,
    list: ["notifications"] as const,
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
  chat: {
    root: ["chat"] as const,
    conversations: ["chat", "conversations"] as const,
    messages: (channelId: string) => ["chat", "messages", channelId] as const,
    unreadCount: ["chat", "unread-count"] as const,
    preferences: ["chat", "preferences"] as const,
  },
  membership: {
    current: ["membership", "current"] as const,
  },
  profile: {
    current: ["profile", "current"] as const,
  },
  settings: {
    current: ["settings", "current"] as const,
  },
};
