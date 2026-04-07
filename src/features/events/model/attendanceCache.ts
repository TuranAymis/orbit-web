import type { QueryClient } from "@tanstack/react-query";
import type { EventDetail, EventListItem } from "@/entities/event/model/types";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export interface EventAttendanceSnapshot {
  previousEvent: EventDetail | undefined;
  previousEvents: EventListItem[] | undefined;
  previousDiscover: DiscoverFeed | undefined;
}

function applyEventAttendanceState<
  T extends { id: string; isJoined: boolean; attendeeCount: number },
>(event: T, eventId: string, nextJoinedState: boolean): T {
  if (event.id !== eventId || event.isJoined === nextJoinedState) {
    return event;
  }

  return {
    ...event,
    isJoined: nextJoinedState,
    attendeeCount: nextJoinedState
      ? event.attendeeCount + 1
      : Math.max(0, event.attendeeCount - 1),
  };
}

export function captureEventAttendanceSnapshot(
  queryClient: QueryClient,
  eventId: string,
): EventAttendanceSnapshot {
  return {
    previousEvent: queryClient.getQueryData<EventDetail>(orbitQueryKeys.events.detail(eventId)),
    previousEvents: queryClient.getQueryData<EventListItem[]>(orbitQueryKeys.events.list),
    previousDiscover: queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed),
  };
}

export function syncEventAttendanceCaches(
  queryClient: QueryClient,
  eventId: string,
  nextJoinedState: boolean,
) {
  const previousEvent = queryClient.getQueryData<EventDetail>(
    orbitQueryKeys.events.detail(eventId),
  );
  const previousEvents = queryClient.getQueryData<EventListItem[]>(orbitQueryKeys.events.list);
  const previousDiscover = queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed);

  if (previousEvent) {
    queryClient.setQueryData<EventDetail>(
      orbitQueryKeys.events.detail(eventId),
      applyEventAttendanceState(previousEvent, eventId, nextJoinedState),
    );
  }

  if (previousEvents) {
    queryClient.setQueryData<EventListItem[]>(
      orbitQueryKeys.events.list,
      previousEvents.map((event) => applyEventAttendanceState(event, eventId, nextJoinedState)),
    );
  }

  if (previousDiscover) {
    queryClient.setQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed, {
      ...previousDiscover,
      events: previousDiscover.events.map((event) =>
        applyEventAttendanceState(event, eventId, nextJoinedState),
      ),
    });
  }
}

export function restoreEventAttendanceCaches(
  queryClient: QueryClient,
  eventId: string,
  snapshot: EventAttendanceSnapshot | undefined,
) {
  if (!snapshot) {
    return;
  }

  if (snapshot.previousEvent) {
    queryClient.setQueryData(orbitQueryKeys.events.detail(eventId), snapshot.previousEvent);
  }

  if (snapshot.previousEvents) {
    queryClient.setQueryData(orbitQueryKeys.events.list, snapshot.previousEvents);
  }

  if (snapshot.previousDiscover) {
    queryClient.setQueryData(orbitQueryKeys.discover.feed, snapshot.previousDiscover);
  }
}
