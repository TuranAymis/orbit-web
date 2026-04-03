import { useCallback, useEffect, useState } from "react";
import type { EventListItem } from "@/entities/event/model/types";
import { listEvents } from "@/features/events/list-events/api/listEvents";

interface UseEventsResult {
  data: EventListItem[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsResult {
  const [data, setData] = useState<EventListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextEvents = await listEvents();
      setData(nextEvents);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error("Failed to load events."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return {
    data,
    isLoading,
    error,
    isEmpty: !isLoading && data.length === 0,
    refetch: loadEvents,
  };
}
