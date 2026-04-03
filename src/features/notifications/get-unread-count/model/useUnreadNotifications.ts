import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/features/notifications/get-unread-count/api/getUnreadCount";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseUnreadNotificationsResult {
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useUnreadNotifications(): UseUnreadNotificationsResult {
  const query = useQuery({
    queryKey: orbitQueryKeys.notifications.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  };
}
