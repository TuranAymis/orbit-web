import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Group } from "@/entities/group/model/types";
import type { GroupDetail } from "@/entities/group/model/types";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import {
  mergeJoinedGroupState,
  type JoinedGroupState,
} from "@/features/groups/model/joinedState";
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
      await Promise.all([
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.all }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.discover.feed }),
        queryClient.cancelQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) }),
      ]);

      const previousGroups = queryClient.getQueryData<Group[]>(orbitQueryKeys.groups.all);
      const previousDiscover = queryClient.getQueryData<DiscoverFeed>(
        orbitQueryKeys.discover.feed,
      );
      const previousGroupDetail = queryClient.getQueryData<GroupDetail>(
        orbitQueryKeys.groups.detail(groupId),
      );
      const previousJoinedState = queryClient.getQueryData<JoinedGroupState>(
        orbitQueryKeys.groups.joinedState,
      );

      if (previousGroups) {
        queryClient.setQueryData<Group[]>(
          orbitQueryKeys.groups.all,
          previousGroups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  isJoined: true,
                  memberCount: group.memberCount + 1,
                }
              : group,
          ),
        );
      }

      if (previousDiscover) {
        queryClient.setQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed, {
          ...previousDiscover,
          groups: previousDiscover.groups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  isJoined: true,
                  memberCount: group.memberCount + 1,
                }
              : group,
          ),
        });
      }

      if (previousGroupDetail) {
        queryClient.setQueryData<GroupDetail>(orbitQueryKeys.groups.detail(groupId), {
          ...previousGroupDetail,
          isJoined: true,
          memberCount: previousGroupDetail.memberCount + 1,
        });
      }

      queryClient.setQueryData<JoinedGroupState>(
        orbitQueryKeys.groups.joinedState,
        mergeJoinedGroupState(previousJoinedState, groupId, true),
      );

      return { previousGroups, previousDiscover, previousGroupDetail, previousJoinedState };
    },
    onError: (_error, groupId, context) => {
      if (context?.previousGroups) {
        queryClient.setQueryData(orbitQueryKeys.groups.all, context.previousGroups);
      }

      if (context?.previousDiscover) {
        queryClient.setQueryData(orbitQueryKeys.discover.feed, context.previousDiscover);
      }

      if (context?.previousGroupDetail) {
        queryClient.setQueryData(
          orbitQueryKeys.groups.detail(groupId),
          context.previousGroupDetail,
        );
      }

      if (context?.previousJoinedState) {
        queryClient.setQueryData(
          orbitQueryKeys.groups.joinedState,
          context.previousJoinedState,
        );
      }

      queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.detail(groupId) });
    },
    onSettled: async (_data, _error, groupId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orbitQueryKeys.groups.all }),
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
