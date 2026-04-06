import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import { getUnreadCount } from "@/features/notifications/get-unread-count/api/getUnreadCount";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseUnreadNotificationsResult {
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
}

export function useUnreadNotifications(): UseUnreadNotificationsResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const isQueryEnabled = authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session);
  const query = useQuery({
    queryKey: orbitQueryKeys.notifications.unreadCount,
    queryFn: getUnreadCount,
    refetchInterval: 30_000,
    enabled: isQueryEnabled,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: !authReady || isAuthLoading || query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  };
}
