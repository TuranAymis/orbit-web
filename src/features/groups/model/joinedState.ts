import type { Group } from "@/entities/group/model/types";
import type { GroupDetail } from "@/entities/group/model/types";

export type JoinedGroupState = Record<string, boolean>;

export function mergeJoinedGroupState(
  previousState: JoinedGroupState | undefined,
  groupId: string,
  isJoined: boolean,
): JoinedGroupState {
  return {
    ...(previousState ?? {}),
    [groupId]: isJoined,
  };
}

export function applyJoinedGroupStateToGroups(
  groups: Group[],
  joinedState: JoinedGroupState | undefined,
): Group[] {
  if (!joinedState) {
    return groups;
  }

  return groups.map((group) =>
    joinedState[group.id] === undefined
      ? group
      : {
          ...group,
          isJoined: joinedState[group.id],
        },
  );
}

export function applyJoinedGroupStateToGroupDetail(
  group: GroupDetail | null,
  joinedState: JoinedGroupState | undefined,
): GroupDetail | null {
  if (!group || !joinedState || joinedState[group.id] === undefined) {
    return group;
  }

  return {
    ...group,
    isJoined: joinedState[group.id],
  };
}
