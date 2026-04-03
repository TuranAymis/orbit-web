import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EventDetail } from "@/entities/event/model/types";
import { getEventDetail } from "@/features/events/get-event-detail/api/getEventDetail";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";
import { leaveEvent } from "@/features/events/leave-event/api/leaveEvent";
import type { EventListItem } from "@/entities/event/model/types";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseEventDetailResult {
  data: EventDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleAttendance: () => Promise<void>;
  isMutatingAttendance: boolean;
}

export function useEventDetail(eventId?: string): UseEventDetailResult {
  const queryClient = useQueryClient();
  const missingEventIdError = eventId ? null : new Error("Missing event id.");
  const query = useQuery({
    queryKey: eventId ? orbitQueryKeys.events.detail(eventId) : orbitQueryKeys.events.detail("missing"),
    queryFn: () => getEventDetail(eventId as string),
    enabled: Boolean(eventId),
  });

  const data = query.data ?? null;
  const mutation = useMutation({
    mutationFn: async (nextJoinedState: boolean) => {
      if (!eventId) {
        throw new Error("Missing event id.");
      }

      if (nextJoinedState) {
        await joinEvent(eventId);
        return true;
      }

      await leaveEvent(eventId);
      return false;
    },
    onMutate: async (nextJoinedState) => {
      if (!eventId) {
        return { previousEvent: null, previousEvents: null, previousDiscover: null };
      }

      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.events.detail(eventId) }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.events.all }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);

      const previousEvent = queryClient.getQueryData<EventDetail>(
        orbitQueryKeys.events.detail(eventId),
      );
      const previousEvents = queryClient.getQueryData<EventListItem[]>(
        orbitQueryKeys.events.all,
      );
      const previousDiscover = queryClient.getQueryData<DiscoverFeed>(
        orbitQueryKeys.discover.feed,
      );

      if (previousEvent) {
        queryClient.setQueryData<EventDetail>(orbitQueryKeys.events.detail(eventId), {
          ...previousEvent,
          isJoined: nextJoinedState,
          attendeeCount: nextJoinedState
            ? previousEvent.attendeeCount + 1
            : Math.max(0, previousEvent.attendeeCount - 1),
        });
      }

      if (previousEvents) {
        queryClient.setQueryData<EventListItem[]>(
          orbitQueryKeys.events.all,
          previousEvents.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  isJoined: nextJoinedState,
                  attendeeCount: nextJoinedState
                    ? event.attendeeCount + 1
                    : Math.max(0, event.attendeeCount - 1),
                }
              : event,
          ),
        );
      }

      if (previousDiscover) {
        queryClient.setQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed, {
          ...previousDiscover,
          events: previousDiscover.events.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  isJoined: nextJoinedState,
                  attendeeCount: nextJoinedState
                    ? event.attendeeCount + 1
                    : Math.max(0, event.attendeeCount - 1),
                }
              : event,
          ),
        });
      }

      return { previousEvent, previousEvents, previousDiscover };
    },
    onError: (_error, _nextJoinedState, context) => {
      if (!eventId) {
        return;
      }

      if (context?.previousEvent) {
        queryClient.setQueryData(orbitQueryKeys.events.detail(eventId), context.previousEvent);
      }

      if (context?.previousEvents) {
        queryClient.setQueryData(orbitQueryKeys.events.all, context.previousEvents);
      }

      if (context?.previousDiscover) {
        queryClient.setQueryData(orbitQueryKeys.discover.feed, context.previousDiscover);
      }
    },
    onSettled: async () => {
      if (!eventId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.events.detail(eventId),
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.events.all,
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.discover.feed,
        }),
      ]);
    },
  });

  const error =
    missingEventIdError ?? (query.error instanceof Error ? query.error : null);

  return {
    data,
    isLoading: eventId ? query.isLoading : false,
    error,
    refetch: async () => {
      if (!eventId) {
        return;
      }

      await query.refetch();
    },
    toggleAttendance: async () => {
      if (!eventId || !data) {
        return;
      }

      await mutation.mutateAsync(!data.isJoined);
    },
    isMutatingAttendance: mutation.isPending,
  };
}
