import { useCallback, useEffect, useState } from "react";
import type { EventDetail } from "@/entities/event/model/types";
import { getEventDetail } from "@/features/events/get-event-detail/api/getEventDetail";
import { joinEvent } from "@/features/events/join-event/api/joinEvent";
import { leaveEvent } from "@/features/events/leave-event/api/leaveEvent";

interface UseEventDetailResult {
  data: EventDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleAttendance: () => Promise<void>;
  isMutatingAttendance: boolean;
}

export function useEventDetail(eventId?: string): UseEventDetailResult {
  const [data, setData] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutatingAttendance, setIsMutatingAttendance] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!eventId) {
      setData(null);
      setIsLoading(false);
      setError(new Error("Missing event id."));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextEvent = await getEventDetail(eventId);
      setData(nextEvent);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError : new Error("Failed to load event."));
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  const toggleAttendance = useCallback(async () => {
    if (!eventId || !data) {
      return;
    }

    setIsMutatingAttendance(true);

    try {
      if (data.isJoined) {
        await leaveEvent(eventId);
        setData({
          ...data,
          isJoined: false,
          attendeeCount: Math.max(0, data.attendeeCount - 1),
        });
      } else {
        await joinEvent(eventId);
        setData({
          ...data,
          isJoined: true,
          attendeeCount: data.attendeeCount + 1,
        });
      }
    } finally {
      setIsMutatingAttendance(false);
    }
  }, [data, eventId]);

  return {
    data,
    isLoading,
    error,
    refetch: loadEvent,
    toggleAttendance,
    isMutatingAttendance,
  };
}
