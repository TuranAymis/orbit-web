export const orbitQueryKeys = {
  groups: {
    all: ["groups"] as const,
    detail: (groupId: string) => ["groups", "detail", groupId] as const,
  },
  events: {
    all: ["events"] as const,
    detail: (eventId: string) => ["events", "detail", eventId] as const,
  },
  discover: {
    all: ["discover"] as const,
    feed: ["discover", "feed"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    unreadCount: ["notifications", "unread-count"] as const,
  },
};
