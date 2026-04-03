import { useCallback, useEffect, useState } from "react";
import type { GroupDetail } from "@/entities/group/model/types";
import { getGroupDetail } from "@/features/groups/get-group-detail/api/getGroupDetail";
import { joinGroup } from "@/features/groups/join-group/api/joinGroup";
import { leaveGroup } from "@/features/groups/leave-group/api/leaveGroup";

interface UseGroupDetailResult {
  data: GroupDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleMembership: () => Promise<void>;
  isMutatingMembership: boolean;
}

export function useGroupDetail(groupId?: string): UseGroupDetailResult {
  const [data, setData] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMutatingMembership, setIsMutatingMembership] = useState(false);

  const loadGroup = useCallback(async () => {
    if (!groupId) {
      setData(null);
      setIsLoading(false);
      setError(new Error("Missing group id."));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextGroup = await getGroupDetail(groupId);
      setData(nextGroup);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError : new Error("Failed to load group."),
      );
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const toggleMembership = useCallback(async () => {
    if (!groupId || !data) {
      return;
    }

    setIsMutatingMembership(true);

    try {
      if (data.isJoined) {
        await leaveGroup(groupId);
        setData({
          ...data,
          isJoined: false,
          memberCount: Math.max(0, data.memberCount - 1),
        });
      } else {
        await joinGroup(groupId);
        setData({
          ...data,
          isJoined: true,
          memberCount: data.memberCount + 1,
        });
      }
    } finally {
      setIsMutatingMembership(false);
    }
  }, [data, groupId]);

  return {
    data,
    isLoading,
    error,
    refetch: loadGroup,
    toggleMembership,
    isMutatingMembership,
  };
}
