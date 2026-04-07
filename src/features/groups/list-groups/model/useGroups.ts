import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import type { Group } from "@/entities/group/model/types";
import { listGroups } from "@/features/groups/list-groups/api/listGroups";
import { hasValidAccessToken } from "@/features/auth/auth-storage";
import {
  applyJoinedGroupStateToGroups,
  type JoinedGroupState,
} from "@/features/groups/model/joinedState";
import { orbitQueryKeys } from "@/shared/lib/query/query-keys";

interface UseGroupsResult {
  data: Group[];
  isLoading: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => Promise<void>;
}

export function useGroups(): UseGroupsResult {
  const { authReady, isAuthenticated, isLoading: isAuthLoading, session } = useAuth();
  const queryClient = useQueryClient();
  const isQueryEnabled = authReady && !isAuthLoading && isAuthenticated && hasValidAccessToken(session);
  const query = useQuery({
    queryKey: orbitQueryKeys.groups.list,
    queryFn: listGroups,
    enabled: isQueryEnabled,
  });

  const joinedState = queryClient.getQueryData<JoinedGroupState>(
    orbitQueryKeys.groups.joinedState,
  );
  const data = applyJoinedGroupStateToGroups(query.data ?? [], joinedState);
  const isLoading = !authReady || isAuthLoading || query.isLoading;
  const error = query.error instanceof Error ? query.error : null;

  return {
    data,
    isLoading,
    error,
    isEmpty: !isLoading && !error && data.length === 0,
    refetch: async () => {
      await query.refetch();
    },
  };
}
