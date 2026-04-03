import { useCallback, useEffect, useState } from "react";
import {
  getDiscoverFeed,
} from "@/features/discover/get-discover-feed/api/getDiscoverFeed";
import type {
  DiscoverFeed,
  DiscoverTrendItem,
} from "@/features/discover/get-discover-feed/mappers/discoverMapper";

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
  const [feed, setFeed] = useState<DiscoverFeed>(initialFeed);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadDiscoverFeed = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextFeed = await getDiscoverFeed();
      setFeed(nextFeed);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError
          : new Error("Failed to load discover feed."),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDiscoverFeed();
  }, [loadDiscoverFeed]);

  return {
    ...feed,
    isLoading,
    error,
    isEmpty:
      !isLoading &&
      feed.groups.length === 0 &&
      feed.events.length === 0 &&
      feed.trending.length === 0,
    refetch: loadDiscoverFeed,
  };
}
