import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  type CreateEventInput,
  type CreatedEvent,
} from "@/features/events/create-event/api/createEvent";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation<CreatedEvent, Error, CreateEventInput>({
    mutationFn: createEvent,
    onSuccess: async (createdEvent, input) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.events.all }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.events.detail(createdEvent.id),
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.groups.detail(input.groupId),
        }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);
    },
  });
}
