import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/entities/notification/model/types";
import { markNotificationRead } from "@/features/notifications/mark-notification-read/api/markNotificationRead";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.notifications.all }),
        queryClient.cancelQueries({
          queryKey: orbitQueryKeys.notifications.unreadCount,
        }),
      ]);

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        orbitQueryKeys.notifications.all,
      );
      const previousUnreadCount = queryClient.getQueryData<number>(
        orbitQueryKeys.notifications.unreadCount,
      );

      const targetWasUnread = previousNotifications?.some(
        (notification) => notification.id === notificationId && !notification.isRead,
      );

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          orbitQueryKeys.notifications.all,
          previousNotifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
      }

      if (typeof previousUnreadCount === "number" && targetWasUnread) {
        queryClient.setQueryData<number>(
          orbitQueryKeys.notifications.unreadCount,
          Math.max(0, previousUnreadCount - 1),
        );
      }

      return {
        previousNotifications,
        previousUnreadCount,
      };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          orbitQueryKeys.notifications.all,
          context.previousNotifications,
        );
      }

      if (typeof context?.previousUnreadCount === "number") {
        queryClient.setQueryData(
          orbitQueryKeys.notifications.unreadCount,
          context.previousUnreadCount,
        );
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.notifications.all }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.notifications.unreadCount,
        }),
      ]);
    },
  });
}
