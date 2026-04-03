import { useQuery } from "@tanstack/react-query";
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
  const query = useQuery({
    queryKey: orbitQueryKeys.notifications.all,
    queryFn: listNotifications,
    refetchInterval: 30_000,
  });

  const data = query.data ?? [];

  return {
    data,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    isEmpty: !query.isLoading && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
