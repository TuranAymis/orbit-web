import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/config/appConfig";
import type { GroupDetail } from "@/entities/group/model/types";
import type { Group } from "@/entities/group/model/types";
import { useAuth } from "@/features/auth/useAuth";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import { getGroupDetail } from "@/features/groups/get-group-detail/api/getGroupDetail";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import { leaveGroup } from "@/features/groups/leave-group/api/leaveGroup";
import {
  applyJoinedGroupStateToGroupDetail,
  type JoinedGroupState,
} from "@/features/groups/model/joinedState";
import {
  captureGroupMembershipSnapshot,
  restoreGroupMembershipCaches,
  syncGroupMembershipCaches,
} from "@/features/groups/model/membershipCache";
import { logMutationLifecycle } from "@/shared/lib/mutations/mutationLogger";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseGroupDetailResult {
  data: GroupDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleMembership: () => Promise<void>;
  isMutatingMembership: boolean;
  membershipError: Error | null;
}

export function useGroupDetail(groupId?: string): UseGroupDetailResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const queryClient = useQueryClient();
  const missingGroupIdError = groupId ? null : new Error("Missing group id.");
  const isQueryEnabled =
    Boolean(groupId) &&
    authReady &&
    !isAuthLoading &&
    isAuthenticated &&
    hasValidAccessToken(session);
  const query = useQuery({
    queryKey: groupId ? orbitQueryKeys.groups.detail(groupId) : orbitQueryKeys.groups.detail("missing"),
    queryFn: () => getGroupDetail(groupId as string),
    enabled: isQueryEnabled,
  });

  const joinedState = queryClient.getQueryData<JoinedGroupState>(
    orbitQueryKeys.groups.joinedState,
  );
  const data = applyJoinedGroupStateToGroupDetail(query.data ?? null, joinedState);
  const mutation = useMutation({
    mutationFn: async (nextJoinedState: boolean) => {
      if (!groupId) {
        throw new Error("Missing group id.");
      }

      if (nextJoinedState) {
        await joinGroup(groupId);
        return true;
      }

      await leaveGroup(groupId);
      return false;
    },
    onMutate: async (nextJoinedState) => {
      if (!groupId) {
        return undefined;
      }

      logMutationLifecycle("group.membership.toggle", "start", {
        groupId,
        nextJoinedState,
      });

      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.list }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
      ]);

      const snapshot = captureGroupMembershipSnapshot(queryClient, groupId);
      syncGroupMembershipCaches(queryClient, groupId, nextJoinedState);
      return snapshot;
    },
    onSuccess: (_data, nextJoinedState) => {
      if (!groupId) {
        return;
      }

      logMutationLifecycle("group.membership.toggle", "success", {
        groupId,
        nextJoinedState,
      });
    },
    onError: (_error, _nextJoinedState, context) => {
      if (groupId) {
        logMutationLifecycle("group.membership.toggle", "rollback", { groupId });
        restoreGroupMembershipCaches(queryClient, groupId, context);
      }
    },
    onSettled: async () => {
      if (!groupId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.groups.list,
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.groups.detail(groupId),
        }),
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.discover.feed,
        }),
      ]);
    },
  });

  const error =
    missingGroupIdError ?? (query.error instanceof Error ? query.error : null);

  if (appConfig.isDevelopment) {
    console.info("[orbit:group-detail] query started", {
      groupId: groupId ?? null,
      authReady,
      isAuthenticated,
      enabled: isQueryEnabled,
    });
    if (error) {
      console.info("[orbit:group-detail] query failed", {
        groupId: groupId ?? null,
        message: error.message,
      });
    }
  }

  return {
    data,
    isLoading: groupId ? !authReady || isAuthLoading || query.isLoading : false,
    error,
    refetch: async () => {
      if (!groupId) {
        return;
      }

      await query.refetch();
    },
    toggleMembership: async () => {
      if (!groupId || !data) {
        return;
      }

      await mutation.mutateAsync(!data.isJoined);
    },
    isMutatingMembership: mutation.isPending,
    membershipError: mutation.error instanceof Error ? mutation.error : null,
  };
}
