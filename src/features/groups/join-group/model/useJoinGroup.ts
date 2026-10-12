import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { executeOrQueue } from "@/shared/lib/mutations/offlineMutation";
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
  const { user } = useAuth();

  const mutation = useMutation({
    networkMode: "always",
    mutationFn: async (groupId: string) => {
      const queued = await executeOrQueue(user?.id, "group.join", groupId, () => joinGroup(groupId));
      return { groupId, queued };
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
    onSettled: async (result, _error, groupId) => {
      if (result?.queued) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.list }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.discover.feed }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) }),
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.chat.conversations }),
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
