import { useQuery } from "@tanstack/react-query";
import type { EventListItem } from "@/entities/event/model/types";
import { listEvents } from "@/features/events/list-events/api/listEvents";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseEventsResult {
  data: EventListItem[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useEvents(): UseEventsResult {
  const query = useQuery({
    queryKey: orbitQueryKeys.events.all,
    queryFn: listEvents,
  });

  const data = query.data ?? [];
  const error = query.error instanceof Error ? query.error : null;

  return {
    data,
    isLoading: query.isLoading,
    error,
    isEmpty: !query.isLoading && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
