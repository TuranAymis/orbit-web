export type NotificationType =
  | "group"
  | "event"
  | "chat"
  | "membership"
  | "system";

export type NotificationRelatedEntityType =
  | "group"
  | "event"
  | "chat"
  | "membership"
  | "unknown";

export interface NotificationActor {
  id: string;
  name: string;
  avatarFallback: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  relatedEntityType: NotificationRelatedEntityType;
  relatedEntityId: string | null;
  actor: NotificationActor | null;
  actionUrl: string | null;
}
