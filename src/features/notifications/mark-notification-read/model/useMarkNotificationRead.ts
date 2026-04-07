import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Notification } from "@/entities/notification/model/types";
import { markNotificationRead } from "@/features/notifications/mark-notification-read/api/markNotificationRead";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (notificationId) => {
      logMutationLifecycle("notification.read", "start", { notificationId });
      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.notifications.list }),
        queryClient.cancelQueries({
          queryKey: orbitQueryKeys.notifications.unreadCount,
        }),
      ]);

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        orbitQueryKeys.notifications.list,
      );
      const previousUnreadCount = queryClient.getQueryData<number>(
        orbitQueryKeys.notifications.unreadCount,
      );

      const targetWasUnread = previousNotifications?.some(
        (notification) => notification.id === notificationId && !notification.isRead,
      );

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(
          orbitQueryKeys.notifications.list,
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
    onSuccess: (_data, notificationId) => {
      logMutationLifecycle("notification.read", "success", { notificationId });
    },
    onError: (_error, _notificationId, context) => {
      logMutationLifecycle("notification.read", "rollback", {
        notificationId: _notificationId,
      });
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          orbitQueryKeys.notifications.list,
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
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.notifications.list }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.notifications.unreadCount,
        }),
      ]);
    },
  });
}
