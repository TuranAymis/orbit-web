import { useQuery } from "@tanstack/react-query";
import { getDiscoverFeed } from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import type {
  DiscoverFeed,
  DiscoverTrendItem,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseDiscoverFeedResult extends DiscoverFeed {
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

const initialFeed: DiscoverFeed = {
  groups: [],
  events: [],
  trending: [],
};

export type { DiscoverTrendItem };

export function useDiscoverFeed(): UseDiscoverFeedResult {
  const query = useQuery({
    queryKey: orbitQueryKeys.discover.feed,
    queryFn: getDiscoverFeed,
  });

  const feed = query.data ?? initialFeed;
  const error = query.error instanceof Error ? query.error : null;

  return {
    ...feed,
    isLoading: query.isLoading,
    error,
    isEmpty:
      !query.isLoading &&
      feed.groups.length === 0 &&
      feed.events.length === 0 &&
      feed.trending.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
