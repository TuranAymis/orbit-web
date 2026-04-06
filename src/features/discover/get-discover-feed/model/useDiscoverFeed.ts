import { useQuery } from "@tanstack/react-query";
import { appConfig } from "@/config/appConfig";
import { useAuth } from "@/features/auth/useAuth";
import {
  getDiscoverFeed,
  type DiscoverFeedResult,
} from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import type {
  DiscoverFeed,
  DiscoverTrendItem,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseDiscoverFeedResult extends DiscoverFeed {
  isLoading: boolean;
  error: Error | null;
  groupsError?: Error | null;
  eventsError?: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

const initialFeed: DiscoverFeedResult = {
  groups: [],
  events: [],
  trending: [],
  groupsError: null,
  eventsError: null,
};

export type { DiscoverTrendItem };

export function useDiscoverFeed(): UseDiscoverFeedResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const isQueryEnabled =
    import.meta.env.MODE === "test" || (authReady && !isAuthLoading && isAuthenticated);
  const query = useQuery({
    queryKey: orbitQueryKeys.discover.feed,
    queryFn: getDiscoverFeed,
    enabled: isQueryEnabled,
  });

  const feed = query.data ?? initialFeed;
  const queryError = query.error instanceof Error ? query.error : null;
  const error =
    queryError ??
    (feed.groupsError && feed.eventsError
      ? new Error("Discover feed is currently unavailable.")
      : null);

  if (appConfig.isDevelopment) {
    console.log("AUTH READY:", authReady);
    console.log("TOKEN:", Boolean(session?.accessToken));
    console.log("EVENT QUERY ENABLED:", isQueryEnabled);
    console.info("[orbit:discover] query started", {
      authReady,
      isAuthenticated,
      enabled: isQueryEnabled,
    });
  }

  return {
    ...feed,
    isLoading: isAuthLoading || query.isLoading,
    error,
    isEmpty:
      !query.isLoading &&
      !error &&
      feed.groups.length === 0 &&
      feed.events.length === 0 &&
      feed.trending.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
