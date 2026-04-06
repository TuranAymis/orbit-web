import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroup } from "@/features/groups/delete-group/api/deleteGroup";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export function useDeleteGroup(groupId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!groupId) {
        throw new Error("Missing group id.");
      }

      await deleteGroup(groupId);
      return groupId;
    },
    onSuccess: async (deletedGroupId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.all }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.groups.detail(deletedGroupId),
        }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);
    },
  });
}
