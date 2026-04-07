import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/config/appConfig";
import { useAuth } from "@/features/auth/useAuth";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import {
  applyJoinedGroupStateToGroups,
  type JoinedGroupState,
} from "@/features/groups/model/joinedState";
import {
  getDiscoverFeed,
  type DiscoverFeedResult,
} from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import type {
  DiscoverFeed,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import {
  createDiscoverPageData,
  type DiscoverPageData,
} from "@/features/discover/get-discover-feed/model/discoverPageData";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseDiscoverFeedResult {
  data: DiscoverPageData;
  error: Error | null;
  feed: DiscoverFeed;
  refetch: () => Promise<void>;
}

const initialFeed: DiscoverFeedResult = {
  groups: [],
  events: [],
  trending: [],
  groupsError: null,
  eventsError: null,
};

export function useDiscoverFeed(): UseDiscoverFeedResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const queryClient = useQueryClient();
  const isQueryEnabled =
    authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session);
  const query = useQuery({
    queryKey: orbitQueryKeys.discover.feed,
    queryFn: getDiscoverFeed,
    enabled: isQueryEnabled,
  });

  const feed = query.data ?? initialFeed;
  const joinedState = queryClient.getQueryData<JoinedGroupState>(
    orbitQueryKeys.groups.joinedState,
  );
  const groups = applyJoinedGroupStateToGroups(feed.groups, joinedState);
  const normalizedFeed: DiscoverFeed = {
    groups,
    events: feed.events,
    trending: feed.trending,
  };
  const queryError = query.error instanceof Error ? query.error : null;
  const discoverPageData = createDiscoverPageData(normalizedFeed, {
    isLoading: !authReady || isAuthLoading || query.isLoading,
    groupsError: feed.groupsError,
    eventsError: feed.eventsError,
  });
  const error = queryError;

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
    data: discoverPageData,
    error,
    feed: normalizedFeed,
    refetch: async () => {
      await query.refetch();
    },
  };
}
