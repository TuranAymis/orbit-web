import { useMutation, useQueryClient } from "@tanstack/react-query";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import {
  captureGroupMembershipSnapshot,
  restoreGroupMembershipCaches,
  syncGroupMembershipCaches,
} from "@/features/groups/model/membershipCache";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseJoinGroupResult {
  joinById: (groupId: string) => Promise<void>;
  pendingGroupId: string | null;
  error: Error | null;
}

export function useJoinGroup(): UseJoinGroupResult {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (groupId: string) => {
      await joinGroup(groupId);
      return groupId;
    },
    onMutate: async (groupId) => {
      logMutationLifecycle("group.join", "start", { groupId });

      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.list }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) }),
      ]);

      const snapshot = captureGroupMembershipSnapshot(queryClient, groupId);
      syncGroupMembershipCaches(queryClient, groupId, true);
      return snapshot;
    },
    onSuccess: (_data, groupId) => {
      logMutationLifecycle("group.join", "success", { groupId });
    },
    onError: (_error, groupId, context) => {
      logMutationLifecycle("group.join", "rollback", { groupId });
      restoreGroupMembershipCaches(queryClient, groupId, context);

      queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) });
    },
    onSettled: async (_data, _error, groupId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.list }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) }),
      ]);
    },
  });

  return {
    joinById: async (groupId: string) => {
      await mutation.mutateAsync(groupId);
    },
    pendingGroupId:
      mutation.isPending && typeof mutation.variables === "string"
        ? mutation.variables
        : null,
    error: mutation.error instanceof Error ? mutation.error : null,
  };
}
