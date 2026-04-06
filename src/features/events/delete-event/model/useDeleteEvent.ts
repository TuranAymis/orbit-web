import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEvent } from "@/features/events/delete-event/api/deleteEvent";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseDeleteEventOptions {
  eventId?: string;
  groupId?: string | null;
}

export function useDeleteEvent({ eventId, groupId }: UseDeleteEventOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!eventId) {
        throw new Error("Missing event id.");
      }

      await deleteEvent(eventId);
      return eventId;
    },
    onSuccess: async (deletedEventId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.events.all }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.events.detail(deletedEventId),
        }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
        ...(groupId
          ? [
              queryClient.invalidateQueries({
                queryKey: orbitQueryKeys.groups.detail(groupId),
              }),
            ]
          : []),
      ]);
    },
  });
}
