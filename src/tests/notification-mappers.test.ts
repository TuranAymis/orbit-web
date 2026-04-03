import { describe, expect, it } from "vitest";
import {
  mapNotificationsResponse,
  mapUnreadCountResponse,
} from "@/entities/notification/mappers";

describe("notification mappers", () => {
  it("maps backend notification payloads into domain notifications", () => {
    const notifications = mapNotificationsResponse([
      {
        id: "notif_1",
        type: "event",
        title: "Event reminder",
        message: "Design Systems Review starts in 30 minutes.",
        createdAt: "2026-04-03T10:00:00.000Z",
        isRead: false,
        relatedEntityType: "event",
        relatedEntityId: "design-systems-review",
        actor: {
          id: "user_1",
          name: "Annie Case",
          avatarFallback: "AC",
        },
        actionUrl: "/events/design-systems-review",
      },
    ]);

    expect(notifications[0]).toMatchObject({
      id: "notif_1",
      type: "event",
      relatedEntityType: "event",
      actor: {
        name: "Annie Case",
      },
    });
  });

  it("maps unread count payloads safely", () => {
    expect(mapUnreadCountResponse({ unreadCount: 4 })).toBe(4);
    expect(mapUnreadCountResponse(2)).toBe(2);
  });
});
