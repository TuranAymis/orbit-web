import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  type CreateGroupInput,
  type CreatedGroup,
} from "@/features/groups/create-group/api/createGroup";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation<CreatedGroup, Error, CreateGroupInput>({
    mutationFn: createGroup,
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.all }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);
    },
  });
}
