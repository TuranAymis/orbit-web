import type { QueryClient } from "@tanstack/react-query";
import type { Group, GroupDetail } from "@/entities/group/model/types";
import type { DiscoverFeed } from "@/features/discover/get-discover-feed/mappers/discoverMapper";
import {
  mergeJoinedGroupState,
  type JoinedGroupState,
} from "@/features/groups/model/joinedState";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

export interface GroupMembershipSnapshot {
  previousGroups: Group[] | undefined;
  previousDiscover: DiscoverFeed | undefined;
  previousGroupDetail: GroupDetail | undefined;
  previousJoinedState: JoinedGroupState | undefined;
}

function applyGroupMembershipState<T extends { id: string; isJoined: boolean; memberCount: number }>(
  group: T,
  groupId: string,
  nextJoinedState: boolean,
): T {
  if (group.id !== groupId || group.isJoined === nextJoinedState) {
    return group;
  }

  return {
    ...group,
    isJoined: nextJoinedState,
    memberCount: nextJoinedState
      ? group.memberCount + 1
      : Math.max(0, group.memberCount - 1),
  };
}

export function captureGroupMembershipSnapshot(
  queryClient: QueryClient,
  groupId: string,
): GroupMembershipSnapshot {
  return {
    previousGroups: queryClient.getQueryData<Group[]>(orbitQueryKeys.groups.list),
    previousDiscover: queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed),
    previousGroupDetail: queryClient.getQueryData<GroupDetail>(
      orbitQueryKeys.groups.detail(groupId),
    ),
    previousJoinedState: queryClient.getQueryData<JoinedGroupState>(
      orbitQueryKeys.groups.joinedState,
    ),
  };
}

export function syncGroupMembershipCaches(
  queryClient: QueryClient,
  groupId: string,
  nextJoinedState: boolean,
) {
  const previousGroups = queryClient.getQueryData<Group[]>(orbitQueryKeys.groups.list);
  const previousDiscover = queryClient.getQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed);
  const previousGroupDetail = queryClient.getQueryData<GroupDetail>(
    orbitQueryKeys.groups.detail(groupId),
  );
  const previousJoinedState = queryClient.getQueryData<JoinedGroupState>(
    orbitQueryKeys.groups.joinedState,
  );

  if (previousGroups) {
    queryClient.setQueryData<Group[]>(
      orbitQueryKeys.groups.list,
      previousGroups.map((group) => applyGroupMembershipState(group, groupId, nextJoinedState)),
    );
  }

  if (previousDiscover) {
    queryClient.setQueryData<DiscoverFeed>(orbitQueryKeys.discover.feed, {
      ...previousDiscover,
      groups: previousDiscover.groups.map((group) =>
        applyGroupMembershipState(group, groupId, nextJoinedState),
      ),
    });
  }

  if (previousGroupDetail) {
    queryClient.setQueryData<GroupDetail>(
      orbitQueryKeys.groups.detail(groupId),
      applyGroupMembershipState(previousGroupDetail, groupId, nextJoinedState),
    );
  }

  queryClient.setQueryData<JoinedGroupState>(
    orbitQueryKeys.groups.joinedState,
    mergeJoinedGroupState(previousJoinedState, groupId, nextJoinedState),
  );
}

export function restoreGroupMembershipCaches(
  queryClient: QueryClient,
  groupId: string,
  snapshot: GroupMembershipSnapshot | undefined,
) {
  if (!snapshot) {
    return;
  }

  if (snapshot.previousGroups) {
    queryClient.setQueryData(orbitQueryKeys.groups.list, snapshot.previousGroups);
  }

  if (snapshot.previousDiscover) {
    queryClient.setQueryData(orbitQueryKeys.discover.feed, snapshot.previousDiscover);
  }

  if (snapshot.previousGroupDetail) {
    queryClient.setQueryData(
      orbitQueryKeys.groups.detail(groupId),
      snapshot.previousGroupDetail,
    );
  }

  if (snapshot.previousJoinedState) {
    queryClient.setQueryData(orbitQueryKeys.groups.joinedState, snapshot.previousJoinedState);
  }
}
