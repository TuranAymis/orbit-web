import type {
  Notification,
  NotificationActor,
  NotificationRelatedEntityType,
  NotificationType,
} from "@/entities/notification/model/types";
import { mapCollection } from "@/shared/lib/http/collectionMapper";

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
  created_at?: string;
  isRead?: boolean;
  is_read?: boolean;
  relatedEntityType?: string;
  related_entity_type?: string;
  relatedEntityId?: string;
  related_entity_id?: string;
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
    createdAt: response.createdAt ?? response.created_at ?? new Date().toISOString(),
    isRead: response.isRead ?? response.is_read ?? false,
    relatedEntityType: mapRelatedEntityType(response.relatedEntityType ?? response.related_entity_type),
    relatedEntityId: response.relatedEntityId ?? response.related_entity_id ?? null,
    actor: mapActor(response.actor),
    actionUrl: response.actionUrl ?? null,
  };
}

export function mapNotificationsResponse(payload: unknown): Notification[] {
  const collection = mapCollection<NotificationResponse>(payload, ["notifications"]);

  return collection.map((item, index) =>
    mapNotification(item, index),
  );
}

export function mapUnreadCountResponse(payload: unknown): number {
  if (typeof payload === "number") {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const response = payload as { count?: unknown; unreadCount?: unknown };
    const count = response.count ?? response.unreadCount;

    if (typeof count === "number") {
      return count;
    }
  }

  return 0;
}

export function mapPushConfigResponse(payload: { public_key?: string | null; publicKey?: string | null }): string | null {
  return payload.public_key ?? payload.publicKey ?? null;
}
