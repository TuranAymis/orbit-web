import type { Notification } from "@/entities/notification/model/types";
import { NotificationItem } from "@/entities/notification/ui/NotificationItem";

interface NotificationListProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

export function NotificationList({
  notifications,
  onNotificationClick,
}: NotificationListProps) {
  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={onNotificationClick}
        />
      ))}
    </div>
  );
}
