import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { appConfig } from "@/config/appConfig";
import type { GroupDetail } from "@/entities/group/model/types";
import { useAuth } from "@/features/auth/useAuth";
import { getGroupDetail } from "@/features/groups/get-group-detail/api/getGroupDetail";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import { leaveGroup } from "@/features/groups/leave-group/api/leaveGroup";
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
  const { authReady, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();
  const missingGroupIdError = groupId ? null : new Error("Missing group id.");
  const isQueryEnabled =
    Boolean(groupId) &&
    (import.meta.env.MODE === "test" || (authReady && !isAuthLoading && isAuthenticated));
  const query = useQuery({
    queryKey: groupId ? orbitQueryKeys.groups.detail(groupId) : orbitQueryKeys.groups.detail("missing"),
    queryFn: () => getGroupDetail(groupId as string),
    enabled: isQueryEnabled,
  });

  const data = query.data ?? null;
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
        return { previousGroup: null };
      }

      await queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) });

      const previousGroup = queryClient.getQueryData<GroupDetail>(
        orbitQueryKeys.groups.detail(groupId),
      );

      if (previousGroup) {
        queryClient.setQueryData<GroupDetail>(orbitQueryKeys.groups.detail(groupId), {
          ...previousGroup,
          isJoined: nextJoinedState,
          memberCount: nextJoinedState
            ? previousGroup.memberCount + 1
            : Math.max(0, previousGroup.memberCount - 1),
        });
      }

      return { previousGroup };
    },
    onError: (_error, _nextJoinedState, context) => {
      if (groupId && context?.previousGroup) {
        queryClient.setQueryData(
          orbitQueryKeys.groups.detail(groupId),
          context.previousGroup,
        );
      }
    },
    onSettled: async () => {
      if (!groupId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: orbitQueryKeys.groups.all,
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
    isLoading: groupId ? isAuthLoading || query.isLoading : false,
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
