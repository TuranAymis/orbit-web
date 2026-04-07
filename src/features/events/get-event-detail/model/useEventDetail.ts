import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/config/appConfig";
import type { EventDetail } from "@/entities/event/model/types";
import { getEventDetail } from "@/features/events/get-event-detail/api/getEventDetail";
import { useAuth } from "@/features/auth/useAuth";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";
import { leaveEvent } from "@/features/events/leave-event/api/leaveEvent";
import {
  captureEventAttendanceSnapshot,
  restoreEventAttendanceCaches,
  syncEventAttendanceCaches,
} from "@/features/events/model/attendanceCache";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseEventDetailResult {
  data: EventDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleAttendance: () => Promise<void>;
  isMutatingAttendance: boolean;
  attendanceError: Error | null;
}

export function useEventDetail(eventId?: string): UseEventDetailResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const queryClient = useQueryClient();
  const missingEventIdError = eventId ? null : new Error("Missing event id.");
  const isQueryEnabled =
    Boolean(eventId) &&
    authReady &&
    !isAuthLoading &&
    isAuthenticated &&
    hasValidAccessToken(session);
  const query = useQuery({
    queryKey: eventId ? orbitQueryKeys.events.detail(eventId) : orbitQueryKeys.events.detail("missing"),
    queryFn: () => getEventDetail(eventId as string),
    enabled: isQueryEnabled,
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
        return undefined;
      }

      logMutationLifecycle("event.attendance.toggle", "start", {
        eventId,
        nextJoinedState,
      });

      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.events.detail(eventId) }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.events.list }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);

      const snapshot = captureEventAttendanceSnapshot(queryClient, eventId);
      syncEventAttendanceCaches(queryClient, eventId, nextJoinedState);
      return snapshot;
    },
    onSuccess: (_data, nextJoinedState) => {
      if (!eventId) {
        return;
      }

      logMutationLifecycle("event.attendance.toggle", "success", {
        eventId,
        nextJoinedState,
      });
    },
    onError: (_error, _nextJoinedState, context) => {
      if (!eventId) {
        return;
      }

      logMutationLifecycle("event.attendance.toggle", "rollback", { eventId });
      restoreEventAttendanceCaches(queryClient, eventId, context);
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
          queryKey: orbitQueryKeys.events.list,
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.discover.feed,
        }),
      ]);
    },
  });

  const error =
    missingEventIdError ?? (query.error instanceof Error ? query.error : null);

  if (appConfig.isDevelopment) {
    console.log("AUTH READY:", authReady);
    console.log("TOKEN:", Boolean(session?.accessToken));
    console.log("EVENT QUERY ENABLED:", isQueryEnabled);
    console.info("[orbit:event-detail] query started", {
      eventId: eventId ?? null,
      authReady,
      isAuthenticated,
      enabled: isQueryEnabled,
    });
    if (error) {
      console.info("[orbit:event-detail] query failed", {
        eventId: eventId ?? null,
        message: error.message,
      });
    }
  }

  return {
    data,
    isLoading: eventId ? !authReady || isAuthLoading || query.isLoading : false,
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
    attendanceError: mutation.error instanceof Error ? mutation.error : null,
  };
}
