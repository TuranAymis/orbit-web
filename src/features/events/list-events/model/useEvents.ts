import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import type { EventListItem } from "@/entities/event/model/types";
import { listEvents } from "@/features/events/list-events/api/listEvents";
import { appConfig } from "@/config/appConfig";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseEventsResult {
  data: EventListItem[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const isQueryEnabled =
    authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session);

  const query = useQuery({
    queryKey: orbitQueryKeys.events.all,
    queryFn: listEvents,
    enabled: isQueryEnabled,
  });

  const data = query.data ?? [];
  const error = query.error instanceof Error ? query.error : null;

  if (appConfig.isDevelopment) {
    console.log("AUTH READY:", authReady);
    console.log("TOKEN:", Boolean(session?.accessToken));
    console.log("EVENT QUERY ENABLED:", isQueryEnabled);
    if (error) {
      console.info("[orbit:events] query failed", {
        message: error.message,
      });
    }
  }

  return {
    data,
    isLoading: !authReady || isAuthLoading || query.isLoading,
    error,
    isEmpty: !query.isLoading && !error && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
