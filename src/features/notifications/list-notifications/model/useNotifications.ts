import { useQuery } from "@tanstack/react-query";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { useAuth } from "@/features/auth/useAuth";
import type { Notification } from "@/entities/notification/model/types";
import { listNotifications } from "@/features/notifications/list-notifications/api/listNotifications";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseNotificationsResult {
  data: Notification[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const isQueryEnabled = authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session);
  const query = useQuery({
    queryKey: orbitQueryKeys.notifications.all,
    queryFn: listNotifications,
    refetchInterval: 30_000,
    enabled: isQueryEnabled,
  });

  const data = query.data ?? [];

  return {
    data,
    isLoading: !authReady || isAuthLoading || query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    isEmpty: !query.isLoading && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
