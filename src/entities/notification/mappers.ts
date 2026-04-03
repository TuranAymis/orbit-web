import type {
  Notification,
  NotificationActor,
  NotificationRelatedEntityType,
  NotificationType,
} from "@/entities/notification/model/types";

interface NotificationResponseActor {
  id?: string;
  name?: string;
  avatarFallback?: string;
}

interface NotificationResponse {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actor?: NotificationResponseActor | null;
  actionUrl?: string;
}

function mapNotificationType(type?: string): NotificationType {
  switch (type) {
    case "group":
    case "event":
    case "chat":
    case "membership":
      return type;
    default:
      return "system";
  }
}

function mapRelatedEntityType(type?: string): NotificationRelatedEntityType {
  switch (type) {
    case "group":
    case "event":
    case "chat":
    case "membership":
      return type;
    default:
      return "unknown";
  }
}

function mapActor(actor?: NotificationResponseActor | null): NotificationActor | null {
  if (!actor) {
    return null;
  }

  return {
    id: actor.id ?? "actor_unknown",
    name: actor.name ?? "Orbit",
    avatarFallback: actor.avatarFallback ?? "OR",
  };
}

function mapNotification(response: NotificationResponse, index: number): Notification {
  return {
    id: response.id ?? `notification_${index}`,
    type: mapNotificationType(response.type),
    title: response.title ?? "Orbit update",
    message: response.message ?? "You have a new notification.",
    createdAt: response.createdAt ?? new Date().toISOString(),
    isRead: response.isRead ?? false,
    relatedEntityType: mapRelatedEntityType(response.relatedEntityType),
    relatedEntityId: response.relatedEntityId ?? null,
    actor: mapActor(response.actor),
    actionUrl: response.actionUrl ?? null,
  };
}

export function mapNotificationsResponse(payload: unknown): Notification[] {
  const collection = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { notifications?: unknown[] } | null)?.notifications)
      ? ((payload as { notifications: unknown[] }).notifications)
      : [];

  return collection.map((item, index) =>
    mapNotification(item as NotificationResponse, index),
  );
}

export function mapUnreadCountResponse(payload: unknown): number {
  if (typeof payload === "number") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const count = (payload as { unreadCount?: unknown }).unreadCount;

    if (typeof count === "number") {
      return count;
    }
  }

  return 0;
}
